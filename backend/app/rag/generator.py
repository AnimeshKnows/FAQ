"""Groq-backed grounded answer generation with citations."""

from __future__ import annotations

from functools import lru_cache

from groq import Groq

from app.config import Settings, get_settings
from app.models.schemas import ChatMessage, Citation, RetrievedChunk


SYSTEM_PROMPT = """You are a technical documentation assistant for DevDocs RAG.

Answer the user's question using ONLY the provided documentation context.
If the documentation does not contain enough information, say so clearly.
Do not invent APIs, parameters, or behaviors that are not in the context.

Cite sources inline using bracket markers like [1], [2] that match the context blocks.
Be concise and accurate. Prefer concrete steps and code from the docs when relevant.
"""


def _format_context(chunks: list[RetrievedChunk]) -> str:
    blocks: list[str] = []
    for i, chunk in enumerate(chunks, start=1):
        meta = chunk.metadata
        header = (
            f"[{i}] title={meta.title} | section={meta.section} | "
            f"technology={meta.technology} | source={meta.source}"
        )
        if meta.url:
            header += f" | url={meta.url}"
        blocks.append(f"{header}\n{chunk.text}")
    return "\n\n---\n\n".join(blocks)


def build_citations(chunks: list[RetrievedChunk]) -> list[Citation]:
    citations: list[Citation] = []
    for i, chunk in enumerate(chunks, start=1):
        meta = chunk.metadata
        citations.append(
            Citation(
                index=i,
                title=meta.title or meta.source,
                section=meta.section,
                url=meta.url,
                technology=meta.technology,
                chunk_id=meta.chunk_id,
                score=chunk.score,
            )
        )
    return citations


class Generator:
    def __init__(self, settings: Settings | None = None) -> None:
        self.settings = settings or get_settings()
        if not self.settings.groq_api_key:
            self.client = None
        else:
            self.client = Groq(api_key=self.settings.groq_api_key)

    @property
    def configured(self) -> bool:
        return bool(self.settings.groq_api_key) and self.client is not None

    def generate(
        self,
        question: str,
        chunks: list[RetrievedChunk],
        *,
        explain_with_code: bool = False,
        history: list[ChatMessage] | None = None,
    ) -> str:
        if not chunks:
            return (
                "I could not find relevant documentation for this question. "
                "Try rephrasing, selecting a technology filter, or ingesting more docs."
            )
        if not self.configured:
            raise RuntimeError(
                "GROQ_API_KEY is not configured. Copy backend/.env.example to "
                "backend/.env and set your Groq API key."
            )

        context = _format_context(chunks)
        style = ""
        if explain_with_code:
            style = (
                "\nRespond in this structure:\n"
                "1) Concept\n2) Relevant documentation points\n"
                "3) Example code (from or closely based on the context)\n"
                "4) Short explanation\n5) Sources referenced\n"
            )

        user_content = (
            f"Documentation context:\n\n{context}\n\n"
            f"Question: {question}\n"
            f"{style}"
        )

        messages: list[dict[str, str]] = [{"role": "system", "content": SYSTEM_PROMPT}]
        if history:
            for msg in history[-6:]:
                messages.append({"role": msg.role, "content": msg.content})
        messages.append({"role": "user", "content": user_content})

        response = self.client.chat.completions.create(
            model=self.settings.groq_model,
            messages=messages,
            temperature=0.2,
            max_tokens=1024,
        )
        return (response.choices[0].message.content or "").strip()


@lru_cache
def get_generator() -> Generator:
    return Generator()
