"""Hybrid retriever: FAISS dense + BM25 sparse with RRF fusion."""

from __future__ import annotations

import json
import pickle
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import faiss
import numpy as np
from rank_bm25 import BM25Okapi

from app.config import Settings, get_settings
from app.models.schemas import ChunkMetadata, DocumentChunk, RetrievedChunk
from app.rag.embeddings import EmbeddingModel, get_embedding_model

_TOKEN_RE = re.compile(r"[a-zA-Z0-9_]+|\(\)|\[\]")


def tokenize(text: str) -> list[str]:
    return [t.lower() for t in _TOKEN_RE.findall(text)]


@dataclass
class VectorIndex:
    faiss_index: faiss.Index
    chunks: list[DocumentChunk]
    bm25: BM25Okapi
    tokenized_corpus: list[list[str]]
    manifest: dict[str, Any]

    @property
    def chunk_count(self) -> int:
        return len(self.chunks)


class Retriever:
    FAISS_FILE = "index.faiss"
    CHUNKS_FILE = "chunks.json"
    BM25_FILE = "bm25.pkl"
    MANIFEST_FILE = "manifest.json"

    def __init__(
        self,
        settings: Settings | None = None,
        embedder: EmbeddingModel | None = None,
    ) -> None:
        self.settings = settings or get_settings()
        self.embedder = embedder
        self._index: VectorIndex | None = None

    @property
    def vectorstore_dir(self) -> Path:
        return self.settings.vectorstore_dir

    def is_loaded(self) -> bool:
        return self._index is not None

    def chunk_count(self) -> int:
        return self._index.chunk_count if self._index else 0

    def get_manifest(self) -> dict[str, Any] | None:
        return self._index.manifest if self._index else None

    def build(self, chunks: list[DocumentChunk], embedder: EmbeddingModel | None = None) -> VectorIndex:
        embedder = embedder or self.embedder or get_embedding_model()
        self.embedder = embedder
        texts = [c.text for c in chunks]
        vectors = embedder.embed_documents(texts)
        dim = vectors.shape[1] if len(vectors) else embedder.dimension
        index = faiss.IndexFlatIP(dim)
        if len(vectors):
            index.add(vectors)

        tokenized = [tokenize(t) for t in texts]
        bm25 = BM25Okapi(tokenized) if tokenized else BM25Okapi([["empty"]])

        technologies = sorted({c.metadata.technology for c in chunks})
        manifest = {
            "chunk_count": len(chunks),
            "embedding_model": self.settings.embedding_model,
            "dimension": dim,
            "technologies": technologies,
            "chunk_size": self.settings.chunk_size,
            "chunk_overlap": self.settings.chunk_overlap,
        }
        self._index = VectorIndex(
            faiss_index=index,
            chunks=chunks,
            bm25=bm25,
            tokenized_corpus=tokenized,
            manifest=manifest,
        )
        return self._index

    def save(self, directory: Path | None = None) -> None:
        if self._index is None:
            raise RuntimeError("No index to save — call build() first")

        from app.rag.index_versions import (
            migrate_legacy_flat_index,
            prune_versions,
            utc_version_id,
            write_current,
        )

        # One-time migrate of legacy flat files before writing a new version
        migrate_legacy_flat_index(self.settings)

        if directory is not None:
            self._write_index_files(directory)
            return

        version = utc_version_id()
        version_path = self.settings.vectorstore_versions_dir / version
        self._write_index_files(version_path)
        write_current(
            version,
            chunk_count=self._index.chunk_count,
            manifest=self._index.manifest,
            settings=self.settings,
        )
        prune_versions(self.settings)

    def _write_index_files(self, directory: Path) -> None:
        assert self._index is not None
        directory.mkdir(parents=True, exist_ok=True)
        faiss.write_index(self._index.faiss_index, str(directory / self.FAISS_FILE))
        payload = [c.model_dump() for c in self._index.chunks]
        (directory / self.CHUNKS_FILE).write_text(
            json.dumps(payload, ensure_ascii=False, indent=2),
            encoding="utf-8",
        )
        with open(directory / self.BM25_FILE, "wb") as f:
            pickle.dump(
                {
                    "tokenized_corpus": self._index.tokenized_corpus,
                },
                f,
            )
        (directory / self.MANIFEST_FILE).write_text(
            json.dumps(self._index.manifest, indent=2),
            encoding="utf-8",
        )

    def load(self, directory: Path | None = None) -> VectorIndex:
        from app.rag.index_versions import migrate_legacy_flat_index, resolve_active_dir

        if directory is None:
            migrate_legacy_flat_index(self.settings)
            resolved = resolve_active_dir(self.settings)
            if resolved is None:
                raise FileNotFoundError(
                    f"Vector store not found in {self.vectorstore_dir}. Run ingest first."
                )
            directory = resolved

        faiss_path = directory / self.FAISS_FILE
        chunks_path = directory / self.CHUNKS_FILE
        bm25_path = directory / self.BM25_FILE
        manifest_path = directory / self.MANIFEST_FILE
        if not faiss_path.exists() or not chunks_path.exists():
            raise FileNotFoundError(
                f"Vector store not found in {directory}. Run ingest first."
            )

        faiss_index = faiss.read_index(str(faiss_path))
        raw_chunks = json.loads(chunks_path.read_text(encoding="utf-8"))
        chunks = [
            DocumentChunk(
                text=item["text"],
                metadata=ChunkMetadata(**item["metadata"]),
            )
            for item in raw_chunks
        ]

        if bm25_path.exists():
            with open(bm25_path, "rb") as f:
                bm25_data = pickle.load(f)
            tokenized = bm25_data["tokenized_corpus"]
        else:
            tokenized = [tokenize(c.text) for c in chunks]
        bm25 = BM25Okapi(tokenized) if tokenized else BM25Okapi([["empty"]])

        manifest = {}
        if manifest_path.exists():
            manifest = json.loads(manifest_path.read_text(encoding="utf-8"))

        self._index = VectorIndex(
            faiss_index=faiss_index,
            chunks=chunks,
            bm25=bm25,
            tokenized_corpus=tokenized,
            manifest=manifest,
        )
        return self._index

    def try_load(self) -> bool:
        try:
            self.load()
            return True
        except FileNotFoundError:
            self._index = None
            return False

    def _ensure_index(self) -> VectorIndex:
        if self._index is None:
            self.load()
        assert self._index is not None
        return self._index

    def _filter_indices(
        self,
        indices: list[int],
        technology: str | None,
    ) -> list[int]:
        if not technology:
            return indices
        tech = technology.lower()
        index = self._ensure_index()
        return [
            i
            for i in indices
            if index.chunks[i].metadata.technology.lower() == tech
        ]

    def dense_search(
        self,
        query: str,
        top_k: int | None = None,
        technology: str | None = None,
    ) -> list[RetrievedChunk]:
        index = self._ensure_index()
        top_k = top_k or self.settings.retrieve_top_k
        embedder = self.embedder or get_embedding_model()
        self.embedder = embedder
        q = embedder.embed_query(query).reshape(1, -1)
        # Over-fetch then filter by technology
        fetch_k = min(len(index.chunks), max(top_k * 5, top_k))
        if fetch_k == 0:
            return []
        scores, idxs = index.faiss_index.search(q, fetch_k)
        results: list[RetrievedChunk] = []
        for score, idx in zip(scores[0], idxs[0]):
            if idx < 0:
                continue
            if technology and index.chunks[idx].metadata.technology.lower() != technology.lower():
                continue
            chunk = index.chunks[idx]
            results.append(
                RetrievedChunk(
                    text=chunk.text,
                    metadata=chunk.metadata,
                    score=float(score),
                )
            )
            if len(results) >= top_k:
                break
        return results

    def bm25_search(
        self,
        query: str,
        top_k: int | None = None,
        technology: str | None = None,
    ) -> list[RetrievedChunk]:
        index = self._ensure_index()
        top_k = top_k or self.settings.retrieve_top_k
        if not index.chunks:
            return []
        tokens = tokenize(query)
        scores = index.bm25.get_scores(tokens)
        ranked = sorted(range(len(scores)), key=lambda i: scores[i], reverse=True)
        ranked = self._filter_indices(ranked, technology)
        results: list[RetrievedChunk] = []
        for i in ranked[:top_k]:
            chunk = index.chunks[i]
            results.append(
                RetrievedChunk(
                    text=chunk.text,
                    metadata=chunk.metadata,
                    score=float(scores[i]),
                )
            )
        return results

    @staticmethod
    def reciprocal_rank_fusion(
        rankings: list[list[RetrievedChunk]],
        k: int = 60,
        top_k: int = 10,
    ) -> list[RetrievedChunk]:
        scores: dict[str, float] = {}
        best: dict[str, RetrievedChunk] = {}
        for ranking in rankings:
            for rank, chunk in enumerate(ranking):
                cid = chunk.metadata.chunk_id
                scores[cid] = scores.get(cid, 0.0) + 1.0 / (k + rank + 1)
                if cid not in best or (chunk.score or 0) > (best[cid].score or 0):
                    best[cid] = chunk
        ordered = sorted(scores.items(), key=lambda x: x[1], reverse=True)
        fused: list[RetrievedChunk] = []
        for cid, rrf_score in ordered[:top_k]:
            chunk = best[cid]
            fused.append(
                RetrievedChunk(
                    text=chunk.text,
                    metadata=chunk.metadata,
                    score=float(rrf_score),
                )
            )
        return fused

    def hybrid_search(
        self,
        query: str,
        top_k: int | None = None,
        technology: str | None = None,
        mode: str = "hybrid",
    ) -> list[RetrievedChunk]:
        top_k = top_k or self.settings.retrieve_top_k
        if mode == "dense":
            return self.dense_search(query, top_k=top_k, technology=technology)
        if mode == "bm25":
            return self.bm25_search(query, top_k=top_k, technology=technology)
        dense = self.dense_search(query, top_k=top_k, technology=technology)
        sparse = self.bm25_search(query, top_k=top_k, technology=technology)
        return self.reciprocal_rank_fusion([dense, sparse], top_k=top_k)


_retriever: Retriever | None = None


def get_retriever() -> Retriever:
    global _retriever
    if _retriever is None:
        _retriever = Retriever()
        _retriever.try_load()
    return _retriever


def reset_retriever() -> Retriever:
    global _retriever
    _retriever = Retriever()
    _retriever.try_load()
    return _retriever
