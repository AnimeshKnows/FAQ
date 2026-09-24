"""Smoke test against running API."""

import httpx

base = "http://127.0.0.1:8000"

with httpx.Client(timeout=180.0) as client:
    r = client.get(f"{base}/health")
    print("HEALTH", r.status_code, r.json())

    r = client.post(
        f"{base}/api/chat",
        json={
            "question": "How do I use Depends in FastAPI?",
            "technology": "fastapi",
            "debug": True,
        },
    )
    print("CHAT", r.status_code, r.text[:500])

    r = client.post(
        f"{base}/api/retrieve",
        json={
            "question": "How do I use Depends in FastAPI?",
            "technology": "fastapi",
            "mode": "hybrid",
            "rerank": True,
        },
    )
    print("RETRIEVE", r.status_code)
    data = r.json()
    print("count", data["retrieved_count"])
    for i, c in enumerate(data["chunks"], 1):
        meta = c["metadata"]
        print(
            f"  {i}. [{meta['technology']}] {meta['title']} / {meta['section']} "
            f"score={c.get('score')}"
        )

    r = client.post(
        f"{base}/api/retrieve",
        json={
            "question": "How do I create middleware?",
            "technology": "react",
            "mode": "hybrid",
            "rerank": True,
        },
    )
    print("FILTER react middleware", r.status_code)
    for i, c in enumerate(r.json()["chunks"][:3], 1):
        meta = c["metadata"]
        print(f"  {i}. [{meta['technology']}] {meta['source']}")
