"""Index version listing, activation, backup, and pruning helpers."""

from __future__ import annotations

import json
import shutil
import zipfile
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from app.config import Settings, get_settings

CURRENT_FILE = "current.json"
INDEX_FILES = ("index.faiss", "chunks.json", "bm25.pkl", "manifest.json")


def utc_version_id() -> str:
    return datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")


def read_current(settings: Settings | None = None) -> dict[str, Any] | None:
    settings = settings or get_settings()
    path = settings.vectorstore_current_path
    if not path.exists():
        return None
    return json.loads(path.read_text(encoding="utf-8"))


def write_current(
    version: str,
    *,
    chunk_count: int | None = None,
    manifest: dict[str, Any] | None = None,
    settings: Settings | None = None,
) -> dict[str, Any]:
    settings = settings or get_settings()
    payload: dict[str, Any] = {
        "version": version,
        "activated_at": datetime.now(timezone.utc).isoformat(),
    }
    if chunk_count is not None:
        payload["chunk_count"] = chunk_count
    if manifest:
        payload["manifest"] = manifest
    settings.vectorstore_current_path.write_text(
        json.dumps(payload, indent=2),
        encoding="utf-8",
    )
    return payload


def version_dir(version: str, settings: Settings | None = None) -> Path:
    settings = settings or get_settings()
    return settings.vectorstore_versions_dir / version


def resolve_active_dir(settings: Settings | None = None) -> Path | None:
    """Return directory containing the active index files, or None."""
    settings = settings or get_settings()
    current = read_current(settings)
    if current and current.get("version"):
        path = version_dir(str(current["version"]), settings)
        if (path / "index.faiss").exists() and (path / "chunks.json").exists():
            return path

    # Legacy flat layout in vectorstore root
    root = settings.vectorstore_dir
    if (root / "index.faiss").exists() and (root / "chunks.json").exists():
        return root
    return None


def list_versions(settings: Settings | None = None) -> dict[str, Any]:
    settings = settings or get_settings()
    versions_root = settings.vectorstore_versions_dir
    versions_root.mkdir(parents=True, exist_ok=True)
    current = read_current(settings)
    current_id = current.get("version") if current else None
    items: list[dict[str, Any]] = []
    for path in sorted(versions_root.iterdir(), reverse=True):
        if not path.is_dir():
            continue
        if not (path / "index.faiss").exists():
            continue
        manifest: dict[str, Any] = {}
        manifest_path = path / "manifest.json"
        if manifest_path.exists():
            manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
        items.append(
            {
                "version": path.name,
                "is_current": path.name == current_id,
                "chunk_count": manifest.get("chunk_count"),
                "manifest": manifest,
            }
        )
    return {
        "current": current_id,
        "versions": items,
        "count": len(items),
    }


def prune_versions(settings: Settings | None = None) -> list[str]:
    settings = settings or get_settings()
    keep = max(1, settings.index_version_keep)
    versions_root = settings.vectorstore_versions_dir
    if not versions_root.exists():
        return []
    dirs = sorted(
        [p for p in versions_root.iterdir() if p.is_dir()],
        key=lambda p: p.name,
        reverse=True,
    )
    removed: list[str] = []
    for path in dirs[keep:]:
        shutil.rmtree(path, ignore_errors=True)
        removed.append(path.name)
    return removed


def migrate_legacy_flat_index(settings: Settings | None = None) -> str | None:
    """If flat index files exist and no versions yet, copy into versions/ once."""
    settings = settings or get_settings()
    root = settings.vectorstore_dir
    versions_root = settings.vectorstore_versions_dir
    if any(versions_root.glob("*/index.faiss")):
        return None
    if not (root / "index.faiss").exists() or not (root / "chunks.json").exists():
        return None

    version = utc_version_id()
    dest = versions_root / version
    dest.mkdir(parents=True, exist_ok=True)
    for name in INDEX_FILES:
        src = root / name
        if src.exists():
            shutil.copy2(src, dest / name)
    manifest: dict[str, Any] = {}
    if (dest / "manifest.json").exists():
        manifest = json.loads((dest / "manifest.json").read_text(encoding="utf-8"))
    write_current(
        version,
        chunk_count=manifest.get("chunk_count"),
        manifest=manifest,
        settings=settings,
    )
    return version


def activate_version(version: str, settings: Settings | None = None) -> dict[str, Any]:
    settings = settings or get_settings()
    path = version_dir(version, settings)
    if not (path / "index.faiss").exists() or not (path / "chunks.json").exists():
        raise FileNotFoundError(f"Version not found or incomplete: {version}")
    manifest: dict[str, Any] = {}
    if (path / "manifest.json").exists():
        manifest = json.loads((path / "manifest.json").read_text(encoding="utf-8"))
    return write_current(
        version,
        chunk_count=manifest.get("chunk_count"),
        manifest=manifest,
        settings=settings,
    )


def backup_version(
    version: str | None = None,
    settings: Settings | None = None,
) -> Path:
    settings = settings or get_settings()
    if version is None:
        current = read_current(settings)
        if not current or not current.get("version"):
            raise FileNotFoundError("No current version to backup")
        version = str(current["version"])

    src = version_dir(version, settings)
    if not src.is_dir() or not (src / "index.faiss").exists():
        raise FileNotFoundError(f"Version not found: {version}")

    backups = settings.vectorstore_backups_dir
    backups.mkdir(parents=True, exist_ok=True)
    stamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    out = backups / f"{version}_{stamp}.zip"
    with zipfile.ZipFile(out, "w", compression=zipfile.ZIP_DEFLATED) as zf:
        for path in src.rglob("*"):
            if path.is_file():
                zf.write(path, arcname=str(path.relative_to(src)))
    return out
