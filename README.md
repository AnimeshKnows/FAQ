# Framework for Answering Questions — Developer Documentation AI Assistant

Citation-aware Retrieval-Augmented Generation over technical documentation (FastAPI + React corpus in v1).

## Stack

- **Backend:** Python, FastAPI
- **Embeddings:** `BAAI/bge-small-en-v1.5` (Sentence Transformers)
- **Vector store:** FAISS (+ BM25 hybrid via `rank-bm25`)
- **Reranker:** `BAAI/bge-reranker-base`
- **LLM:** Groq (configurable model)
- **Frontend:** Vite + React (scrollytelling tunnel UI + glass chat overlay)

## D: drive layout

| Path | Purpose |
|------|---------|
| `D:\FAQ\` | Project root |
| `D:\FAQ\backend\.venv\` | Python virtualenv (all pip packages) |
| `D:\HF_CACHE\` | HuggingFace / sentence-transformers model cache |
| `D:\FAQ\backend\vectorstore\` | FAISS + BM25 indexes |

## Setup

```powershell
cd D:\FAQ\backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
$env:HF_HOME="D:\HF_CACHE"
$env:TRANSFORMERS_CACHE="D:\HF_CACHE"
$env:SENTENCE_TRANSFORMERS_HOME="D:\HF_CACHE"
$env:PIP_CACHE_DIR="D:\HF_CACHE\pip"
pip install -r requirements.txt
copy .env.example .env
# Edit .env and set GROQ_API_KEY=...
```

## Ingest documentation

```powershell
cd D:\FAQ\backend
.\.venv\Scripts\Activate.ps1
$env:HF_HOME="D:\HF_CACHE"
python scripts\ingest.py
```

## Run API

```powershell
cd D:\FAQ\backend
.\.venv\Scripts\Activate.ps1
$env:HF_HOME="D:\HF_CACHE"
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

- Health: `GET http://127.0.0.1:8000/health`
- Swagger: `http://127.0.0.1:8000/docs`
- Retrieve (no Groq needed): `POST http://127.0.0.1:8000/api/retrieve`
- Chat (requires `GROQ_API_KEY`): `POST http://127.0.0.1:8000/api/chat`
- Ingest: `POST http://127.0.0.1:8000/api/documents/ingest`

### Example retrieve (curl / Postman)

```powershell
curl -X POST http://127.0.0.1:8000/api/retrieve `
  -H "Content-Type: application/json" `
  -d "{\"question\":\"How do I use Depends in FastAPI?\",\"technology\":\"fastapi\",\"mode\":\"hybrid\",\"rerank\":true}"
```

### Example chat (curl)

```powershell
curl -X POST http://127.0.0.1:8000/api/chat `
  -H "Content-Type: application/json" `
  -d "{\"question\":\"How do I use Depends in FastAPI?\",\"technology\":\"fastapi\",\"explain_with_code\":true,\"debug\":true}"
```

Restart the API after editing `.env` so settings reload.

## Run frontend

```powershell
cd D:\FAQ\frontend
npm install --cache "D:\HF_CACHE\npm"
copy .env.example .env
npm run dev
```

Open `http://127.0.0.1:5173` — scrollytelling landing + glass chat overlay (wired to FastAPI).

See [frontend/README.md](frontend/README.md).

## Docker (production-ready)

Runs Redis (shared rate limits), FastAPI backend replicas, and an nginx frontend. The UI talks to the API on the **same origin**; nginx proxies `/api` and `/health` to `backend` (Compose DNS round-robins across replicas).

### Backend only

```powershell
docker compose -f docker-compose.backend.yml up --build -d
docker compose -f docker-compose.backend.yml --profile tools run --rm ingest
docker compose -f docker-compose.backend.yml restart backend
```

See [backend/README.md](backend/README.md). Image defaults: `DOCS_ENABLED=false`, `INGEST_ENABLED=false`, `REQUIRE_GROQ_KEY=true`. Set `CORS_ORIGINS` to your frontend origin(s).

### Full stack

- Docker Desktop / Engine with Compose v2
- Root `.env` with at least `GROQ_API_KEY` (copy from [`.env.example`](.env.example))
- Prefer a local index first: `python backend/scripts/ingest.py` (or use the ingest profile below)
- ~2–4+ GB RAM **per backend replica** for embeddings + reranker; first model download is large (cached in the `hf_cache` volume)

### Start

```powershell
cd D:\FAQ
copy .env.example .env
# Edit .env and set GROQ_API_KEY=...

docker compose up --build -d
```

- App: http://localhost (or `FRONTEND_PORT`)
- Swagger via proxy: http://localhost/docs
- Backend is **internal only** (no host port) so you can scale replicas safely

### Scale backends

```powershell
docker compose up -d --scale backend=2
```

Shared `vectorstore` + `hf_cache` volumes keep retrieval consistent. Redis keeps rate limits consistent across replicas.

Debug API on the host (single instance):

```powershell
docker compose run --rm -p 8000:8000 backend
```

### Rate limits (defaults)

| Route | Limit |
|-------|--------|
| `POST /api/chat` | 20/minute per IP |
| `POST /api/retrieve` | 60/minute per IP |
| `POST /api/documents/ingest` (and activate/backup) | 3/hour per IP |

Override via `RATE_LIMIT_*` and `REDIS_URL` in `.env`. Exceeded requests return **429**.

### Index versions and backups

Ingest writes to `backend/vectorstore/versions/{utc_id}/` and updates `current.json` (keeps last `INDEX_VERSION_KEEP`, default 5). Legacy flat indexes are migrated automatically on first load/save.

```powershell
# Rebuild index (creates a new version + zip backup)
docker compose --profile tools run --rm ingest
docker compose restart backend

# Zip current version
docker compose --profile tools run --rm backup

# Local CLI
python backend\scripts\backup_index.py --list
python backend\scripts\backup_index.py
```

HTTP:

- `GET /api/documents/versions`
- `POST /api/documents/activate` `{ "version": "..." }`
- `POST /api/documents/backup` `{ "version": null }`

### Useful commands

```powershell
docker compose logs -f backend
docker compose ps
docker compose down
```

Volumes: `hf_cache` (HuggingFace models), bind mounts for `backend/vectorstore` and `backend/data/raw`.

## Evaluation

```powershell
cd D:\FAQ
.\backend\.venv\Scripts\Activate.ps1
$env:HF_HOME="D:\HF_CACHE"
python evaluation\evaluate.py --mode dense --k 5
python evaluation\evaluate.py --mode hybrid --k 5
python evaluation\evaluate.py --mode hybrid --rerank --k 5
```

## Process notes

- RAG chat + citations are the product; the landing UI is the singularity tunnel (no Spline dependency).
- Large downloads (pip / HF models / npm cache) must stay on D:; ask before adding new heavy packages.
- Do not commit secrets (`.env`), vector indexes, eval result dumps, or `*.splinecode` scene files.
