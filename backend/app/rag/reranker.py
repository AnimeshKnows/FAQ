"""Cross-encoder reranker (BAAI/bge-reranker-base)."""

from __future__ import annotations

from functools import lru_cache

from app.config import Settings, get_settings
from app.models.schemas import RetrievedChunk


class Reranker:
    def __init__(self, settings: Settings | None = None) -> None:
        self.settings = settings or get_settings()
        self.settings.apply_hf_env()
        from sentence_transformers import CrossEncoder

        self.model = CrossEncoder(self.settings.reranker_model)

    def rerank(
        self,
        query: str,
        chunks: list[RetrievedChunk],
        top_k: int | None = None,
    ) -> list[RetrievedChunk]:
        if not chunks:
            return []
        top_k = top_k or self.settings.rerank_top_k
        pairs = [(query, c.text) for c in chunks]
        scores = self.model.predict(pairs)
        scored = list(zip(chunks, scores))
        scored.sort(key=lambda x: float(x[1]), reverse=True)
        result: list[RetrievedChunk] = []
        for chunk, score in scored[:top_k]:
            result.append(
                RetrievedChunk(
                    text=chunk.text,
                    metadata=chunk.metadata,
                    score=float(score),
                )
            )
        return result


@lru_cache
def get_reranker() -> Reranker:
    return Reranker()
