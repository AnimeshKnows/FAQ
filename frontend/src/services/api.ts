const API_BASE =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "") ||
  "http://127.0.0.1:8000";

export type Technology = "all" | "fastapi" | "react";

export interface ApiCitation {
  index: number;
  title: string;
  section: string;
  url?: string;
  technology?: string;
  chunk_id?: string;
  score?: number | null;
}

export interface ChatApiResponse {
  answer: string;
  citations: ApiCitation[];
  retrieved_count: number;
  debug?: Record<string, unknown> | null;
}

export interface HealthResponse {
  status: string;
  app: string;
  index_loaded: boolean;
  chunk_count: number;
  groq_configured: boolean;
  embedding_model: string;
  reranker_model: string;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const text = await response.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { detail: text };
    }
  }

  if (!response.ok) {
    const detail =
      data && typeof data === "object" && data !== null && "detail" in data
        ? String((data as { detail: unknown }).detail)
        : `Request failed (${response.status})`;
    throw new Error(detail);
  }

  return data as T;
}

export function health() {
  return request<HealthResponse>("/health");
}

export function listTechnologies() {
  return request<{ technologies: string[] }>("/api/documents/technologies");
}

export function chat(params: {
  question: string;
  technology?: Technology | null;
  explain_with_code?: boolean;
}) {
  const technology =
    !params.technology || params.technology === "all"
      ? null
      : params.technology;

  return request<ChatApiResponse>("/api/chat", {
    method: "POST",
    body: JSON.stringify({
      question: params.question,
      technology,
      explain_with_code: Boolean(params.explain_with_code),
      history: [],
      debug: false,
    }),
  });
}

export { API_BASE };
