# Python runtime for DevDocs RAG API
FROM python:3.11-slim-bookworm

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    HF_HOME=/cache/hf \
    TRANSFORMERS_CACHE=/cache/hf \
    SENTENCE_TRANSFORMERS_HOME=/cache/hf \
    HF_HUB_CACHE=/cache/hf/hub \
    HOME=/tmp

WORKDIR /app

# System deps for scientific wheels / sentence-transformers
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        build-essential \
        curl \
        git \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --upgrade pip \
    && pip install -r requirements.txt

COPY app ./app
COPY scripts ./scripts
COPY data ./data
# Prefer a prebuilt index via volume (./backend/vectorstore); .gitkeep keeps path present
COPY vectorstore ./vectorstore

RUN mkdir -p /cache/hf /app/data/processed /app/vectorstore \
    && useradd --create-home --uid 10001 appuser \
    && chown -R appuser:appuser /app /cache

USER appuser

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=10s --start-period=90s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8000/health', timeout=5)"

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"]
