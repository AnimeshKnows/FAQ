"""Application settings — env-driven for local + container deploys."""

from __future__ import annotations

import os
from functools import lru_cache
from pathlib import Path

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_ROOT = Path(__file__).resolve().parent.parent


def _default_hf_home() -> str:
    # Prefer Linux/container path when present; otherwise a portable user cache.
    if Path("/cache/hf").exists() or os.environ.get("HF_HOME"):
        return os.environ.get("HF_HOME", "/cache/hf")
    return str(Path.home() / ".cache" / "huggingface")


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=str(BACKEND_ROOT / ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_name: str = "DevDocs RAG"
    debug: bool = False
    host: str = "0.0.0.0"
    port: int = 8000

    groq_api_key: str = ""
    groq_model: str = "openai/gpt-oss-20b"

    hf_home: str = Field(default_factory=_default_hf_home)
    transformers_cache: str = ""
    sentence_transformers_home: str = ""

    embedding_model: str = "BAAI/bge-small-en-v1.5"
    reranker_model: str = "BAAI/bge-reranker-base"

    retrieve_top_k: int = 10
    rerank_top_k: int = 5
    chunk_size: int = 800
    chunk_overlap: int = 100

    data_raw_dir: Path = BACKEND_ROOT / "data" / "raw"
    data_processed_dir: Path = BACKEND_ROOT / "data" / "processed"
    vectorstore_dir: Path = BACKEND_ROOT / "vectorstore"

    # Comma-separated origins; empty = allow all (dev only). Example:
    # CORS_ORIGINS=https://example.com,https://www.example.com
    cors_origins: str = "*"

    # Production toggles
    docs_enabled: bool = True
    ingest_enabled: bool = True
    require_groq_key: bool = False

    # Rate limiting (Redis-backed when available)
    redis_url: str = "redis://127.0.0.1:6379/0"
    rate_limit_enabled: bool = True
    rate_limit_chat: str = "20/minute"
    rate_limit_retrieve: str = "60/minute"
    rate_limit_ingest: str = "3/hour"

    # Index versioning
    index_version_keep: int = 5

    @field_validator("port", mode="before")
    @classmethod
    def _port_from_platform(cls, value: object) -> object:
        # Railway / Render / Fly inject PORT
        env_port = os.environ.get("PORT")
        if env_port:
            return env_port
        return value

    @property
    def cors_origin_list(self) -> list[str]:
        raw = (self.cors_origins or "").strip()
        if not raw or raw == "*":
            return ["*"]
        return [o.strip() for o in raw.split(",") if o.strip()]

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
        hf = self.hf_home
        transformers = self.transformers_cache or hf
        st = self.sentence_transformers_home or hf
        os.environ["HF_HOME"] = hf
        os.environ["TRANSFORMERS_CACHE"] = transformers
        os.environ["SENTENCE_TRANSFORMERS_HOME"] = st
        os.environ.setdefault("HF_HUB_CACHE", str(Path(hf) / "hub"))


@lru_cache
def get_settings() -> Settings:
    settings = Settings()
    settings.apply_hf_env()
    return settings
