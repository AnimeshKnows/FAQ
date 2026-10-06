# Backend — DevDocs RAG API

Citation-aware retrieval + Groq generation over Markdown under `data/raw/`.

## Local run

```powershell
cd D:\FAQ\backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
$env:HF_HOME="D:\HF_CACHE"
pip install -r requirements.txt
copy .env.example .env
# set GROQ_API_KEY=...
python scripts\ingest.py
uvicorn app.main:app --host 127.0.0.1 --port 8000
```

- Health: `GET /health`
- Chat: `POST /api/chat`
- Retrieve: `POST /api/retrieve`

## Deploy with Docker (backend only)

From the **repo root**:

```powershell
copy .env.example .env
# Required: GROQ_API_KEY
# Recommended for public hosts:
#   CORS_ORIGINS=https://your-frontend.example
#   DOCS_ENABLED=false
#   INGEST_ENABLED=false
#   REQUIRE_GROQ_KEY=true

docker compose -f docker-compose.backend.yml up --build -d

# Build the vector index once (mounts ./backend/vectorstore)
docker compose -f docker-compose.backend.yml --profile tools run --rm ingest
docker compose -f docker-compose.backend.yml restart backend
```

API: `http://localhost:8000/health`

### Production image defaults

The Dockerfile sets:

| Variable | Default in image |
|----------|------------------|
| `DOCS_ENABLED` | `false` (no `/docs`) |
| `INGEST_ENABLED` | `false` (no public ingest/activate/backup) |
| `REQUIRE_GROQ_KEY` | `true` |
| `PORT` | `8000` (honors platform `PORT` if set) |
| `HF_HOME` | `/cache/hf` |

Rebuild the index offline or with the `ingest` profile before serving traffic. Mount a persistent volume at `/app/vectorstore`.

### Single-container (no Compose)

```powershell
cd D:\FAQ\backend
docker build -t faq-backend .
docker run --rm -p 8000:8000 `
  -e GROQ_API_KEY=... `
  -e REDIS_URL=redis://host.docker.internal:6379/0 `
  -e CORS_ORIGINS=https://your-app.example `
  -v ${PWD}/vectorstore:/app/vectorstore `
  -v hf_cache:/cache/hf `
  faq-backend
```

Redis is recommended for shared rate limits; without it the API falls back to in-memory limits.

## Important env vars

| Variable | Purpose |
|----------|---------|
| `GROQ_API_KEY` | Required for `/api/chat` |
| `CORS_ORIGINS` | Comma-separated allowlist (`*` = allow all) |
| `DOCS_ENABLED` | Expose Swagger (`/docs`) |
| `INGEST_ENABLED` | Allow ingest / activate / backup HTTP APIs |
| `REQUIRE_GROQ_KEY` | Fail startup if Groq key missing |
| `REDIS_URL` | Rate-limit store |
| `PORT` / `HOST` | Bind address (PaaS sets `PORT`) |

See also root [README.md](../README.md) and [docker-compose.yml](../docker-compose.yml) for full stack (frontend + backend).
