# DevDocs AI — Frontend

Singularity / scrollytelling UI (tunnel canvas + HUD + chat overlay), wired to the FastAPI RAG backend.

## Run

Backend on `:8000` first, then:

```powershell
cd D:\FAQ\frontend
npm install --cache "D:\HF_CACHE\npm"
copy .env.example .env
npm run dev
```

Open http://127.0.0.1:5173

## Env

| Variable | Default |
|----------|---------|
| `VITE_API_BASE_URL` | `http://127.0.0.1:8000` (local). Docker build sets `""` so the browser uses same-origin nginx proxy. |

## Docker

From the repo root (see root README):

```powershell
docker compose up --build -d
```

Frontend image is multi-stage: Vite build → nginx with `/api` and `/health` proxied to `backend:8000`.

## Layout

- Scroll journey with 3D tunnel (`TunnelCanvas`)
- HUD chrome + stages (`HUDChrome`, `ScrollyJourney`)
- Full-screen glass chat (`ChatOverlay`) → `POST /api/chat`
- Citation inspector (`CitationDrawer`)

Previous Spline UI is kept at `frontend-legacy-spline/` for reference.
