"""Verify Groq chat after .env update."""

import httpx

base = "http://127.0.0.1:8000"

with httpx.Client(timeout=180.0) as client:
    health = client.get(f"{base}/health").json()
    print("groq_configured:", health.get("groq_configured"))
    print("index_loaded:", health.get("index_loaded"))

    r = client.post(
        f"{base}/api/chat",
        json={
            "question": "How do I use Depends in FastAPI?",
            "technology": "fastapi",
            "explain_with_code": True,
            "debug": False,
        },
    )
    print("status:", r.status_code)
    if r.status_code != 200:
        print(r.text[:800])
    else:
        data = r.json()
        print("answer_preview:", (data.get("answer") or "")[:400])
        print("citations:", len(data.get("citations") or []))
        for c in data.get("citations") or []:
            print(f"  [{c['index']}] {c['title']} — {c['section']}")
