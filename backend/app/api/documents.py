"""Document listing and ingestion endpoints."""

from __future__ import annotations

import json
from pathlib import Path

from fastapi import APIRouter, HTTPException

from app.config import get_settings
from app.models.schemas import IngestRequest, IngestStatus
from app.rag.chunker import chunk_documents
from app.rag.embeddings import get_embedding_model
from app.rag.loader import list_technologies, load_documents
from app.rag.retriever import get_retriever, reset_retriever

router = APIRouter(prefix="/api/documents", tags=["documents"])


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
    return IngestStatus(
        status="ok",
        technologies=sorted({d.technology for d in docs}),
        chunk_count=len(chunks),
        message=f"Indexed {len(chunks)} chunks from {len(docs)} documents",
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
    manifest_path = settings.vectorstore_dir / "manifest.json"
    manifest = None
    if manifest_path.exists():
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    return IngestStatus(
        status="ready" if retriever.is_loaded() else "not_indexed",
        technologies=list_technologies(),
        chunk_count=retriever.chunk_count(),
        message="Index loaded" if retriever.is_loaded() else "Run ingest first",
        manifest=manifest,
    )


@router.post("/ingest", response_model=IngestStatus)
def ingest(request: IngestRequest) -> IngestStatus:
    """Synchronously ingest by default (small curated corpus)."""
    try:
        return run_ingest(technologies=request.technologies)
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
