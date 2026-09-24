"""Load Markdown/HTML docs from data/raw/{technology}/ with metadata."""

from __future__ import annotations

import re
from dataclasses import dataclass
from pathlib import Path

from app.config import Settings, get_settings


@dataclass
class RawDocument:
    text: str
    source: str
    technology: str
    title: str
    url: str
    path: Path


_FRONT_MATTER_RE = re.compile(r"^---\s*\n(.*?)\n---\s*\n", re.DOTALL)
_TITLE_RE = re.compile(r"^#\s+(.+)$", re.MULTILINE)
_URL_META_RE = re.compile(r"^url:\s*(.+)$", re.MULTILINE | re.IGNORECASE)
_TITLE_META_RE = re.compile(r"^title:\s*(.+)$", re.MULTILINE | re.IGNORECASE)


def _parse_front_matter(text: str) -> tuple[dict[str, str], str]:
    meta: dict[str, str] = {}
    match = _FRONT_MATTER_RE.match(text)
    if not match:
        return meta, text
    block = match.group(1)
    for line in block.splitlines():
        if ":" in line:
            key, value = line.split(":", 1)
            meta[key.strip().lower()] = value.strip().strip("\"'")
    return meta, text[match.end() :]


def _clean_markdown(text: str) -> str:
    # Strip HTML comments and collapse excessive blank lines
    text = re.sub(r"<!--.*?-->", "", text, flags=re.DOTALL)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def _infer_title(text: str, path: Path, meta: dict[str, str]) -> str:
    if meta.get("title"):
        return meta["title"]
    heading = _TITLE_RE.search(text)
    if heading:
        return heading.group(1).strip()
    return path.stem.replace("-", " ").replace("_", " ").title()


def load_documents(
    technologies: list[str] | None = None,
    settings: Settings | None = None,
) -> list[RawDocument]:
    settings = settings or get_settings()
    raw_root = settings.data_raw_dir
    if not raw_root.exists():
        return []

    tech_dirs = sorted(p for p in raw_root.iterdir() if p.is_dir())
    if technologies:
        wanted = {t.lower() for t in technologies}
        tech_dirs = [p for p in tech_dirs if p.name.lower() in wanted]

    docs: list[RawDocument] = []
    for tech_dir in tech_dirs:
        technology = tech_dir.name.lower()
        for path in sorted(tech_dir.rglob("*")):
            if not path.is_file():
                continue
            if path.suffix.lower() not in {".md", ".markdown", ".html", ".htm", ".txt"}:
                continue
            raw = path.read_text(encoding="utf-8", errors="replace")
            meta, body = _parse_front_matter(raw)
            body = _clean_markdown(body)
            if not body:
                continue
            title = _infer_title(body, path, meta)
            url = meta.get("url", "")
            docs.append(
                RawDocument(
                    text=body,
                    source=str(path.relative_to(raw_root)).replace("\\", "/"),
                    technology=technology,
                    title=title,
                    url=url,
                    path=path,
                )
            )
    return docs


def list_technologies(settings: Settings | None = None) -> list[str]:
    settings = settings or get_settings()
    raw_root = settings.data_raw_dir
    if not raw_root.exists():
        return []
    return sorted(p.name for p in raw_root.iterdir() if p.is_dir())
