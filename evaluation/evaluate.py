"""Retrieval evaluation: Recall@K and Precision@K."""

from __future__ import annotations

import argparse
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

BACKEND_ROOT = Path(__file__).resolve().parents[1] / "backend"
EVAL_ROOT = Path(__file__).resolve().parent
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from app.config import get_settings  # noqa: E402
from app.rag.reranker import get_reranker  # noqa: E402
from app.rag.retriever import Retriever  # noqa: E402


def is_relevant(hit, item: dict) -> bool:
    source = hit.metadata.source.lower()
    tech = hit.metadata.technology.lower()
    text = (hit.text + " " + hit.metadata.section + " " + hit.metadata.title).lower()

    expected_tech = item.get("expected_technology")
    if expected_tech and tech != expected_tech.lower():
        return False

    needle = (item.get("expected_source_contains") or "").lower()
    if needle and needle in source:
        return True

    keywords = [k.lower() for k in item.get("expected_section_keywords") or []]
    if keywords and any(k in text for k in keywords):
        return True
    return False


def recall_at_k(hits, item: dict, k: int) -> float:
    top = hits[:k]
    return 1.0 if any(is_relevant(h, item) for h in top) else 0.0


def precision_at_k(hits, item: dict, k: int) -> float:
    top = hits[:k]
    if not top:
        return 0.0
    relevant = sum(1 for h in top if is_relevant(h, item))
    return relevant / len(top)


def evaluate(mode: str, use_rerank: bool, k: int) -> dict:
    settings = get_settings()
    settings.apply_hf_env()
    questions = json.loads((EVAL_ROOT / "questions.json").read_text(encoding="utf-8"))

    retriever = Retriever(settings=settings)
    retriever.load()

    reranker = get_reranker() if use_rerank else None

    per_question = []
    recalls = []
    precisions = []

    for item in questions:
        hits = retriever.hybrid_search(
            item["question"],
            top_k=settings.retrieve_top_k,
            technology=item.get("expected_technology"),
            mode=mode,
        )
        if reranker:
            hits = reranker.rerank(item["question"], hits, top_k=max(k, settings.rerank_top_k))

        r = recall_at_k(hits, item, k)
        p = precision_at_k(hits, item, k)
        recalls.append(r)
        precisions.append(p)
        per_question.append(
            {
                "id": item["id"],
                "question": item["question"],
                "recall": r,
                "precision": p,
                "top_sources": [
                    {
                        "source": h.metadata.source,
                        "section": h.metadata.section,
                        "technology": h.metadata.technology,
                        "score": h.score,
                    }
                    for h in hits[:k]
                ],
            }
        )

    n = len(questions) or 1
    summary = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "mode": mode,
        "use_rerank": use_rerank,
        "k": k,
        "num_questions": len(questions),
        "recall_at_k": sum(recalls) / n,
        "precision_at_k": sum(precisions) / n,
        "per_question": per_question,
    }
    return summary


def main() -> int:
    parser = argparse.ArgumentParser(description="Evaluate DevDocs RAG retrieval")
    parser.add_argument("--mode", choices=["dense", "bm25", "hybrid"], default="hybrid")
    parser.add_argument("--rerank", action="store_true")
    parser.add_argument("--k", type=int, default=5)
    parser.add_argument(
        "--out",
        type=str,
        default="",
        help="Optional output JSON path under evaluation/results/",
    )
    args = parser.parse_args()

    summary = evaluate(mode=args.mode, use_rerank=args.rerank, k=args.k)
    print(
        f"mode={summary['mode']} rerank={summary['use_rerank']} "
        f"Recall@{args.k}={summary['recall_at_k']:.3f} "
        f"Precision@{args.k}={summary['precision_at_k']:.3f}"
    )

    results_dir = EVAL_ROOT / "results"
    results_dir.mkdir(parents=True, exist_ok=True)
    if args.out:
        out_path = Path(args.out)
        if not out_path.is_absolute():
            out_path = results_dir / out_path
    else:
        tag = f"{args.mode}{'_rerank' if args.rerank else ''}"
        out_path = results_dir / f"eval_{tag}.json"
    out_path.write_text(json.dumps(summary, indent=2), encoding="utf-8")
    print(f"Wrote {out_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
