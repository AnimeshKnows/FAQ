"""DevDocs RAG FastAPI application."""

from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

from app.api import chat, documents, health
from app.config import get_settings
from app.rag.retriever import get_retriever
from app.rate_limit import limiter


@asynccontextmanager
async def lifespan(_app: FastAPI):
    settings = get_settings()
    settings.apply_hf_env()
    if settings.require_groq_key and not settings.groq_api_key:
        raise RuntimeError(
            "GROQ_API_KEY is required (REQUIRE_GROQ_KEY=true) but was not set."
        )
    settings.vectorstore_dir.mkdir(parents=True, exist_ok=True)
    settings.vectorstore_versions_dir.mkdir(parents=True, exist_ok=True)
    settings.vectorstore_backups_dir.mkdir(parents=True, exist_ok=True)
    settings.data_processed_dir.mkdir(parents=True, exist_ok=True)
    get_retriever().try_load()
    yield


def create_app() -> FastAPI:
    settings = get_settings()
    docs_url = "/docs" if settings.docs_enabled else None
    redoc_url = "/redoc" if settings.docs_enabled else None
    openapi_url = "/openapi.json" if settings.docs_enabled else None

    app = FastAPI(
        title=settings.app_name,
        description="Citation-aware RAG over developer documentation",
        version="0.3.0",
        lifespan=lifespan,
        docs_url=docs_url,
        redoc_url=redoc_url,
        openapi_url=openapi_url,
    )
    app.state.limiter = limiter
    app.add_middleware(SlowAPIMiddleware)

    @app.exception_handler(RateLimitExceeded)
    async def rate_limit_handler(request: Request, exc: RateLimitExceeded):
        return JSONResponse(
            status_code=429,
            content={
                "detail": f"Rate limit exceeded: {exc.detail}",
                "error": "too_many_requests",
            },
        )

    origins = settings.cors_origin_list
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=origins != ["*"],
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.include_router(health.router)
    app.include_router(chat.router)
    app.include_router(documents.router)
    return app


app = create_app()
