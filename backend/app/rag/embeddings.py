"""Sentence-Transformers embedding wrapper (cache on D:\\HF_CACHE)."""

from __future__ import annotations

from functools import lru_cache
from typing import Sequence

import numpy as np

from app.config import Settings, get_settings


class EmbeddingModel:
    def __init__(self, settings: Settings | None = None) -> None:
        self.settings = settings or get_settings()
        self.settings.apply_hf_env()
        from sentence_transformers import SentenceTransformer

        self.model = SentenceTransformer(self.settings.embedding_model)
        dim_fn = getattr(self.model, "get_embedding_dimension", None) or getattr(
            self.model, "get_sentence_embedding_dimension"
        )
        self.dimension = int(dim_fn())

    def embed_documents(self, texts: Sequence[str], batch_size: int = 32) -> np.ndarray:
        if not texts:
            return np.zeros((0, self.dimension), dtype=np.float32)
        vectors = self.model.encode(
            list(texts),
            batch_size=batch_size,
            show_progress_bar=len(texts) > 16,
            normalize_embeddings=True,
            convert_to_numpy=True,
        )
        return np.asarray(vectors, dtype=np.float32)

    def embed_query(self, text: str) -> np.ndarray:
        vector = self.model.encode(
            [text],
            normalize_embeddings=True,
            convert_to_numpy=True,
        )[0]
        return np.asarray(vector, dtype=np.float32)


@lru_cache
def get_embedding_model() -> EmbeddingModel:
    return EmbeddingModel()
