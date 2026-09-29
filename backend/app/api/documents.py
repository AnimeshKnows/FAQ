"""Document listing, ingestion, and index version endpoints."""

from __future__ import annotations

import json
from pathlib import Path

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, Field

from app.config import get_settings
from app.models.schemas import IngestRequest, IngestStatus
from app.rag.chunker import chunk_documents
from app.rag.embeddings import get_embedding_model
from app.rag.index_versions import (
    activate_version,
    backup_version,
    list_versions,
    read_current,
)
from app.rag.loader import list_technologies, load_documents
from app.rag.retriever import get_retriever, reset_retriever
from app.rate_limit import limiter

router = APIRouter(prefix="/api/documents", tags=["documents"])


class ActivateRequest(BaseModel):
    version: str = Field(..., min_length=1)


class BackupRequest(BaseModel):
    version: str | None = None


def run_ingest(technologies: list[str] | None = None) -> IngestStatus:
    settings = get_settings()
    settings.apply_hf_env()
    docs = load_documents(technologies=technologies, settings=settings)
    if not docs:
        return IngestStatus(
            status="empty",
            technologies=technologies or [],
            chunk_count=0,
            message="No documents found under data/raw/",
        )

    chunks = chunk_documents(docs, settings=settings)
    settings.data_processed_dir.mkdir(parents=True, exist_ok=True)
    processed_path = settings.data_processed_dir / "chunks.json"
    processed_path.write_text(
        json.dumps([c.model_dump() for c in chunks], ensure_ascii=False, indent=2),
        encoding="utf-8",
    )

    embedder = get_embedding_model()
    retriever = get_retriever()
    retriever.build(chunks, embedder=embedder)
    retriever.save()
    reset_retriever()

    loaded = get_retriever()
    current = read_current(settings)
    backup_path = None
    try:
        backup_path = backup_version(settings=settings)
    except Exception:  # noqa: BLE001
        backup_path = None

    message = f"Indexed {len(chunks)} chunks from {len(docs)} documents"
    if current:
        message += f" (version={current.get('version')})"
    if backup_path:
        message += f"; backup={backup_path.name}"

    return IngestStatus(
        status="ok",
        technologies=sorted({d.technology for d in docs}),
        chunk_count=len(chunks),
        message=message,
        manifest=loaded.get_manifest(),
    )


@router.get("/technologies")
def technologies() -> dict:
    return {"technologies": list_technologies()}


@router.get("/status", response_model=IngestStatus)
def status() -> IngestStatus:
    settings = get_settings()
    retriever = get_retriever()
    if not retriever.is_loaded():
        retriever.try_load()
    current = read_current(settings)
    manifest = retriever.get_manifest()
    if manifest is None and settings.vectorstore_current_path.exists():
        try:
            manifest = json.loads(settings.vectorstore_current_path.read_text(encoding="utf-8")).get(
                "manifest"
            )
        except Exception:  # noqa: BLE001
            manifest = None
    version_note = f" version={current['version']}" if current and current.get("version") else ""
    return IngestStatus(
        status="ready" if retriever.is_loaded() else "not_indexed",
        technologies=list_technologies(),
        chunk_count=retriever.chunk_count(),
        message=(
            f"Index loaded{version_note}"
            if retriever.is_loaded()
            else "Run ingest first"
        ),
        manifest=manifest,
    )


@router.post("/ingest", response_model=IngestStatus)
@limiter.limit(get_settings().rate_limit_ingest)
def ingest(request: Request, body: IngestRequest) -> IngestStatus:
    """Synchronously ingest by default (small curated corpus)."""
    try:
        return run_ingest(technologies=body.technologies)
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=500, detail=f"Ingest failed: {exc}") from exc


@router.get("/raw")
def list_raw() -> dict:
    settings = get_settings()
    files: list[str] = []
    root: Path = settings.data_raw_dir
    if root.exists():
        for path in sorted(root.rglob("*")):
            if path.is_file():
                files.append(str(path.relative_to(root)).replace("\\", "/"))
    return {"files": files}


@router.get("/versions")
def versions() -> dict:
    return list_versions()


@router.post("/activate")
@limiter.limit(get_settings().rate_limit_ingest)
def activate(request: Request, body: ActivateRequest) -> dict:
    try:
        payload = activate_version(body.version)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    reset_retriever()
    retriever = get_retriever()
    return {
        "status": "ok",
        "current": payload,
        "index_loaded": retriever.is_loaded(),
        "chunk_count": retriever.chunk_count(),
    }


@router.post("/backup")
@limiter.limit(get_settings().rate_limit_ingest)
def backup(request: Request, body: BackupRequest | None = None) -> dict:
    body = body or BackupRequest()
    try:
        path = backup_version(version=body.version)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    return {
        "status": "ok",
        "backup": str(path).replace("\\", "/"),
        "name": path.name,
    }
