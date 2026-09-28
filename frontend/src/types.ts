export type Technology = 'all' | 'fastapi' | 'react';

export interface Citation {
  index: number;
  title: string;
  section: string;
  tech: string;
  url: string;
  summary: string;
  chunk_id?: string;
  score?: number;
  codeSnippet?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  codeSnippet?: {
    code: string;
    language: string;
    filename: string;
    versionBadge: string;
  };
  citations?: Citation[];
  techScope?: Technology;
}

export interface BenchmarkQuery {
  id: string;
  ref: string;
  prompt: string;
  tag: 'FastAPI' | 'React';
  description: string;
  tech: Technology;
}

export interface StageThreshold {
  start: number;
  end: number;
  index: number;
  label: string;
  status: string;
}
