# Multi-stage production image for DevDocs RAG API
FROM python:3.11-slim-bookworm AS builder

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /build

RUN apt-get update \
    && apt-get install -y --no-install-recommends build-essential git \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.prod.txt .
RUN pip install --upgrade pip \
    && pip install --prefix=/install -r requirements.prod.txt

FROM python:3.11-slim-bookworm AS runtime

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    HF_HOME=/cache/hf \
    TRANSFORMERS_CACHE=/cache/hf \
    SENTENCE_TRANSFORMERS_HOME=/cache/hf \
    HF_HUB_CACHE=/cache/hf/hub \
    HOME=/tmp \
    HOST=0.0.0.0 \
    PORT=8000 \
    DOCS_ENABLED=false \
    INGEST_ENABLED=false \
    REQUIRE_GROQ_KEY=true \
    CORS_ORIGINS=* \
    RATE_LIMIT_ENABLED=true

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/* \
    && useradd --create-home --uid 10001 appuser \
    && mkdir -p /cache/hf /app/data/processed /app/vectorstore \
    && chown -R appuser:appuser /app /cache

COPY --from=builder /install /usr/local
COPY --chown=appuser:appuser app ./app
COPY --chown=appuser:appuser scripts ./scripts
COPY --chown=appuser:appuser data ./data
COPY --chown=appuser:appuser vectorstore ./vectorstore
COPY --chown=appuser:appuser docker-entrypoint.sh /app/docker-entrypoint.sh

RUN chmod +x /app/docker-entrypoint.sh

USER appuser

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=10s --start-period=120s --retries=3 \
    CMD python -c "import os,urllib.request; p=os.environ.get('PORT','8000'); urllib.request.urlopen(f'http://127.0.0.1:{p}/health', timeout=5)"

ENTRYPOINT ["/app/docker-entrypoint.sh"]
