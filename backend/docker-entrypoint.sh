#!/bin/sh
set -eu

mkdir -p /app/vectorstore /app/data/processed /cache/hf /cache/hf/hub

# Optional: fail fast when chat is required but no key is present
if [ "${REQUIRE_GROQ_KEY:-false}" = "true" ] && [ -z "${GROQ_API_KEY:-}" ]; then
  echo "ERROR: GROQ_API_KEY is required (REQUIRE_GROQ_KEY=true)" >&2
  exit 1
fi

HOST="${HOST:-0.0.0.0}"
PORT="${PORT:-8000}"

exec uvicorn app.main:app --host "$HOST" --port "$PORT" --workers 1 --proxy-headers --forwarded-allow-ips='*'
