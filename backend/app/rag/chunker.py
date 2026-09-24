"""Structure-aware Markdown chunking with size/overlap fallback."""

from __future__ import annotations

import hashlib
import re
from typing import Iterable

from app.config import Settings, get_settings
from app.models.schemas import ChunkMetadata, DocumentChunk
from app.rag.loader import RawDocument

_HEADING_RE = re.compile(r"^(#{1,6})\s+(.+)$", re.MULTILINE)


def _slug(text: str) -> str:
    cleaned = re.sub(r"[^a-zA-Z0-9]+", "-", text.lower()).strip("-")
    return cleaned[:48] or "chunk"


def _chunk_id(technology: str, source: str, section: str, index: int, text: str) -> str:
    digest = hashlib.sha1(f"{source}|{section}|{index}|{text[:64]}".encode()).hexdigest()[:8]
    return f"{technology}-{_slug(section)}-{index:03d}-{digest}"


def _split_by_size(text: str, chunk_size: int, overlap: int) -> list[str]:
    text = text.strip()
    if not text:
        return []
    if len(text) <= chunk_size:
        return [text]

    parts: list[str] = []
    start = 0
    while start < len(text):
        end = min(start + chunk_size, len(text))
        # Prefer breaking on paragraph or sentence boundary
        if end < len(text):
            window = text[start:end]
            break_at = max(window.rfind("\n\n"), window.rfind(". "), window.rfind("\n"))
            if break_at > chunk_size // 3:
                end = start + break_at + 1
        piece = text[start:end].strip()
        if piece:
            parts.append(piece)
        if end >= len(text):
            break
        start = max(0, end - overlap)
    return parts


def _iter_sections(text: str) -> Iterable[tuple[str, str]]:
    """Yield (section_title, section_body) using Markdown headings."""
    matches = list(_HEADING_RE.finditer(text))
    if not matches:
        yield ("Overview", text)
        return

    # Preamble before first heading
    if matches[0].start() > 0:
        preamble = text[: matches[0].start()].strip()
        if preamble:
            yield ("Overview", preamble)

    for i, match in enumerate(matches):
        title = match.group(2).strip()
        start = match.end()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
        body = text[start:end].strip()
        # Keep heading context in body for retrieval quality
        section_text = f"{'#' * len(match.group(1))} {title}\n\n{body}".strip()
        yield (title, section_text)


def chunk_document(
    doc: RawDocument,
    settings: Settings | None = None,
) -> list[DocumentChunk]:
    settings = settings or get_settings()
    chunks: list[DocumentChunk] = []
    index = 0

    for section, section_text in _iter_sections(doc.text):
        pieces = _split_by_size(
            section_text,
            chunk_size=settings.chunk_size,
            overlap=settings.chunk_overlap,
        )
        for piece in pieces:
            meta = ChunkMetadata(
                chunk_id=_chunk_id(doc.technology, doc.source, section, index, piece),
                source=doc.source,
                technology=doc.technology,
                section=section,
                url=doc.url,
                title=doc.title,
            )
            chunks.append(DocumentChunk(text=piece, metadata=meta))
            index += 1
    return chunks


def chunk_documents(
    docs: list[RawDocument],
    settings: Settings | None = None,
) -> list[DocumentChunk]:
    settings = settings or get_settings()
    all_chunks: list[DocumentChunk] = []
    for doc in docs:
        all_chunks.extend(chunk_document(doc, settings=settings))
    return all_chunks
