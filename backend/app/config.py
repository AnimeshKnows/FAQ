"""Application settings — paths default to D: locally; override via env in Docker."""

from __future__ import annotations

from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_ROOT = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=str(BACKEND_ROOT / ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_name: str = "DevDocs RAG"
    debug: bool = False

    groq_api_key: str = ""
    groq_model: str = "openai/gpt-oss-20b"

    hf_home: str = r"D:\HF_CACHE"
    transformers_cache: str = r"D:\HF_CACHE"
    sentence_transformers_home: str = r"D:\HF_CACHE"

    embedding_model: str = "BAAI/bge-small-en-v1.5"
    reranker_model: str = "BAAI/bge-reranker-base"

    retrieve_top_k: int = 10
    rerank_top_k: int = 5
    chunk_size: int = 800
    chunk_overlap: int = 100

    data_raw_dir: Path = BACKEND_ROOT / "data" / "raw"
    data_processed_dir: Path = BACKEND_ROOT / "data" / "processed"
    vectorstore_dir: Path = BACKEND_ROOT / "vectorstore"

    # Rate limiting (Redis-backed when available)
    redis_url: str = "redis://127.0.0.1:6379/0"
    rate_limit_enabled: bool = True
    rate_limit_chat: str = "20/minute"
    rate_limit_retrieve: str = "60/minute"
    rate_limit_ingest: str = "3/hour"

    # Index versioning
    index_version_keep: int = 5

    @property
    def vectorstore_versions_dir(self) -> Path:
        return self.vectorstore_dir / "versions"

    @property
    def vectorstore_backups_dir(self) -> Path:
        return self.vectorstore_dir / "backups"

    @property
    def vectorstore_current_path(self) -> Path:
        return self.vectorstore_dir / "current.json"

    def apply_hf_env(self) -> None:
        """Force HuggingFace / sentence-transformers caches onto configured paths."""
        import os

        os.environ["HF_HOME"] = self.hf_home
        os.environ["TRANSFORMERS_CACHE"] = self.transformers_cache
        os.environ["SENTENCE_TRANSFORMERS_HOME"] = self.sentence_transformers_home
        os.environ.setdefault("HF_HUB_CACHE", str(Path(self.hf_home) / "hub"))


@lru_cache
def get_settings() -> Settings:
    settings = Settings()
    settings.apply_hf_env()
    return settings
