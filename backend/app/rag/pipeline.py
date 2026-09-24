"""End-to-end RAG query pipeline."""

from __future__ import annotations

from app.config import get_settings
from app.models.schemas import ChatRequest, ChatResponse
from app.rag.generator import build_citations, get_generator
from app.rag.reranker import get_reranker
from app.rag.retriever import get_retriever


class RAGPipeline:
    def __init__(self) -> None:
        self.settings = get_settings()

    def ask(self, request: ChatRequest) -> ChatResponse:
        generator = get_generator()
        if not generator.configured:
            raise RuntimeError(
                "GROQ_API_KEY is not configured. Copy backend/.env.example to "
                "backend/.env and set your Groq API key."
            )

        retriever = get_retriever()
        if not retriever.is_loaded():
            if not retriever.try_load():
                raise FileNotFoundError(
                    "Vector index not built. Run `python scripts/ingest.py` "
                    "or POST /api/documents/ingest first."
                )

        retrieved = retriever.hybrid_search(
            query=request.question,
            top_k=self.settings.retrieve_top_k,
            technology=request.technology,
            mode="hybrid",
        )

        reranked = get_reranker().rerank(
            request.question,
            retrieved,
            top_k=self.settings.rerank_top_k,
        )

        answer = generator.generate(
            request.question,
            reranked,
            explain_with_code=request.explain_with_code,
            history=request.history,
        )
        citations = build_citations(reranked)

        debug = None
        if request.debug:
            debug = {
                "retrieved": [
                    {
                        "chunk_id": c.metadata.chunk_id,
                        "title": c.metadata.title,
                        "section": c.metadata.section,
                        "technology": c.metadata.technology,
                        "score": c.score,
                    }
                    for c in retrieved
                ],
                "reranked": [
                    {
                        "chunk_id": c.metadata.chunk_id,
                        "title": c.metadata.title,
                        "section": c.metadata.section,
                        "score": c.score,
                    }
                    for c in reranked
                ],
            }

        return ChatResponse(
            answer=answer,
            citations=citations,
            retrieved_count=len(reranked),
            debug=debug,
        )


_pipeline: RAGPipeline | None = None


def get_pipeline() -> RAGPipeline:
    global _pipeline
    if _pipeline is None:
        _pipeline = RAGPipeline()
    return _pipeline
