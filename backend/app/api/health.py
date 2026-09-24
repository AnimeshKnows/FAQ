"""Health endpoint."""

from fastapi import APIRouter

from app.config import get_settings
from app.models.schemas import HealthResponse
from app.rag.retriever import get_retriever

router = APIRouter(tags=["health"])


@router.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    settings = get_settings()
    retriever = get_retriever()
    if not retriever.is_loaded():
        retriever.try_load()
    return HealthResponse(
        status="ok",
        app=settings.app_name,
        index_loaded=retriever.is_loaded(),
        chunk_count=retriever.chunk_count(),
        groq_configured=bool(settings.groq_api_key),
        embedding_model=settings.embedding_model,
        reranker_model=settings.reranker_model,
    )
