"""Pydantic request/response schemas."""

from __future__ import annotations

from typing import Any, Literal, Optional

from pydantic import BaseModel, Field


class ChunkMetadata(BaseModel):
    chunk_id: str
    source: str
    technology: str
    section: str
    url: str = ""
    title: str = ""


class DocumentChunk(BaseModel):
    text: str
    metadata: ChunkMetadata


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class ChatRequest(BaseModel):
    question: str = Field(..., min_length=1)
    technology: Optional[str] = Field(
        default=None,
        description="Optional filter, e.g. 'fastapi' or 'react'",
    )
    explain_with_code: bool = False
    history: list[ChatMessage] = Field(default_factory=list)
    debug: bool = False


class Citation(BaseModel):
    index: int
    title: str
    section: str
    url: str = ""
    technology: str = ""
    chunk_id: str = ""
    score: Optional[float] = None


class RetrievedChunk(BaseModel):
    text: str
    metadata: ChunkMetadata
    score: Optional[float] = None


class ChatResponse(BaseModel):
    answer: str
    citations: list[Citation] = Field(default_factory=list)
    retrieved_count: int = 0
    debug: Optional[dict[str, Any]] = None


class IngestRequest(BaseModel):
    technologies: Optional[list[str]] = Field(
        default=None,
        description="Subset of techs under data/raw; default = all",
    )
    rebuild: bool = True


class IngestStatus(BaseModel):
    status: str
    technologies: list[str] = Field(default_factory=list)
    chunk_count: int = 0
    message: str = ""
    manifest: Optional[dict[str, Any]] = None


class HealthResponse(BaseModel):
    status: str
    app: str
    index_loaded: bool
    chunk_count: int = 0
    groq_configured: bool
    embedding_model: str
    reranker_model: str
