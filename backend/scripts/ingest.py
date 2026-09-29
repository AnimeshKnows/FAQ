"""CLI ingestion: load → chunk → embed → FAISS + BM25."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

# Ensure backend root is on sys.path when run as a script
BACKEND_ROOT = Path(__file__).resolve().parent.parent
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from app.config import get_settings  # noqa: E402
from app.rag.chunker import chunk_documents  # noqa: E402
from app.rag.embeddings import get_embedding_model  # noqa: E402
from app.rag.loader import load_documents  # noqa: E402
from app.rag.retriever import Retriever  # noqa: E402


def main() -> int:
    parser = argparse.ArgumentParser(description="Ingest documentation into FAISS + BM25")
    parser.add_argument(
        "--tech",
        nargs="*",
        default=None,
        help="Optional technology folder names under data/raw",
    )
    args = parser.parse_args()

    settings = get_settings()
    settings.apply_hf_env()
    print(f"HF_HOME={settings.hf_home}")
    print(f"Loading docs from {settings.data_raw_dir} ...")

    docs = load_documents(technologies=args.tech, settings=settings)
    print(f"Loaded {len(docs)} documents:")
    for doc in docs:
        print(f"  - [{doc.technology}] {doc.title} ({doc.source})")

    if not docs:
        print("No documents found. Add Markdown under data/raw/{tech}/")
        return 1

    chunks = chunk_documents(docs, settings=settings)
    print(f"Created {len(chunks)} chunks")

    settings.data_processed_dir.mkdir(parents=True, exist_ok=True)
    processed = settings.data_processed_dir / "chunks.json"
    processed.write_text(
        json.dumps([c.model_dump() for c in chunks], ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print(f"Wrote {processed}")

    print(f"Loading embedding model {settings.embedding_model} ...")
    embedder = get_embedding_model()
    retriever = Retriever(settings=settings, embedder=embedder)
    retriever.build(chunks, embedder=embedder)
    retriever.save()
    print(f"Saved vector store to {settings.vectorstore_dir}")
    from app.rag.index_versions import read_current  # noqa: E402

    current = read_current(settings)
    if current:
        print(f"Active version: {current.get('version')}")
    print(json.dumps(retriever.get_manifest(), indent=2))

    # Smoke-test dense retrieval
    sample_q = "How do I create a FastAPI dependency?"
    hits = retriever.dense_search(sample_q, top_k=3)
    print(f"\nSample query: {sample_q}")
    for i, hit in enumerate(hits, 1):
        print(
            f"  {i}. [{hit.metadata.technology}] {hit.metadata.title} "
            f"/ {hit.metadata.section} (score={hit.score:.4f})"
        )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
