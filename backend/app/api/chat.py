"""Chat / RAG query endpoint."""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.config import get_settings
from app.models.schemas import ChatRequest, ChatResponse, RetrievedChunk
from app.rag.pipeline import get_pipeline
from app.rag.reranker import get_reranker
from app.rag.retriever import get_retriever

router = APIRouter(prefix="/api", tags=["chat"])


class RetrieveRequest(BaseModel):
    question: str = Field(..., min_length=1)
    technology: str | None = None
    mode: str = Field(default="hybrid", pattern="^(dense|bm25|hybrid)$")
    top_k: int | None = None
    rerank: bool = True


class RetrieveResponse(BaseModel):
    chunks: list[RetrievedChunk]
    retrieved_count: int


@router.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest) -> ChatResponse:
    try:
        return get_pipeline().ask(request)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=500, detail=f"Chat failed: {exc}") from exc


@router.post("/retrieve", response_model=RetrieveResponse)
def retrieve(request: RetrieveRequest) -> RetrieveResponse:
    """Retrieval-only endpoint for Postman/console testing without Groq."""
    settings = get_settings()
    retriever = get_retriever()
    if not retriever.is_loaded() and not retriever.try_load():
        raise HTTPException(
            status_code=503,
            detail="Vector index not built. Run ingest first.",
        )
    top_k = request.top_k or settings.retrieve_top_k
    chunks = retriever.hybrid_search(
        request.question,
        top_k=top_k,
        technology=request.technology,
        mode=request.mode,
    )
    if request.rerank:
        chunks = get_reranker().rerank(
            request.question,
            chunks,
            top_k=settings.rerank_top_k,
        )
    return RetrieveResponse(chunks=chunks, retrieved_count=len(chunks))
