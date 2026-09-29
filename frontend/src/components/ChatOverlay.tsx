import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, Citation, Technology } from '../types';
import { chat as chatApi, listTechnologies } from '../services/api';

interface ChatOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  initialPrompt?: string;
  initialTech?: Technology;
  onInspectCitation: (citation: Citation) => void;
}

function formatTechLabel(tech: string): string {
  const labels: Record<string, string> = {
    c: 'C',
    cpp: 'C++',
    csharp: 'C#',
    java: 'Java',
    javascript: 'JavaScript',
    express: 'Express',
    rest: 'REST',
    django: 'Django',
    fastapi: 'FastAPI',
    react: 'React',
  };
  return labels[tech] || tech.charAt(0).toUpperCase() + tech.slice(1);
}

export const ChatOverlay: React.FC<ChatOverlayProps> = ({
  isOpen,
  onClose,
  initialPrompt,
  initialTech = 'all',
  onInspectCitation,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputVal, setInputVal] = useState('');
  const [selectedTech, setSelectedTech] = useState<Technology>(initialTech);
  const [availableTechs, setAvailableTechs] = useState<string[]>([]);
  const [explainCode, setExplainCode] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const threadEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Load technologies from the API when chat opens
  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    listTechnologies()
      .then((data) => {
        if (!cancelled && Array.isArray(data.technologies)) {
          setAvailableTechs(data.technologies);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setAvailableTechs(['fastapi', 'react']);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  // Sync initial prompt if provided
  useEffect(() => {
    if (initialPrompt && isOpen) {
      setInputVal(initialPrompt);
      if (initialTech) setSelectedTech(initialTech);
    }
  }, [initialPrompt, initialTech, isOpen]);

  // Focus input and lock body scroll on open
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('overflow-hidden');
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 250);
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [isOpen]);

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Auto-scroll chat thread to bottom
  const scrollToBottom = () => {
    threadEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleCopyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  const handleExecute = async (overrideQuery?: string) => {
    const query = (overrideQuery || inputVal).trim();
    if (!query || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      techScope: selectedTech,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputVal('');
    setIsLoading(true);

    try {
      const data = await chatApi({
        question: query,
        technology: selectedTech,
        explain_with_code: explainCode,
      });

      const citations: Citation[] = (data.citations || []).map((c) => ({
        index: c.index,
        title: c.title || 'Documentation',
        section: c.section || '',
        tech: c.technology || selectedTech,
        url: c.url || '',
        summary: c.section
          ? `${c.title} — ${c.section}`
          : c.title || 'Retrieved documentation chunk',
        chunk_id: c.chunk_id,
        score: c.score ?? undefined,
      }));

      const assistantMessage: ChatMessage = {
        id: `asst-${Date.now()}`,
        role: 'assistant',
        content: data.answer || 'No answer returned from the API.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        citations,
        techScope: selectedTech,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Something went wrong talking to the API.';
      const assistantMessage: ChatMessage = {
        id: `asst-err-${Date.now()}`,
        role: 'assistant',
        content: `I couldn't complete that request.\n\n${message}\n\nMake sure the FastAPI backend is running at the configured API URL and the vector index is built.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        techScope: selectedTech,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([]);
  };

  return (
    <div
      className={`fixed inset-0 z-50 glass-singularity flex flex-col transition-all duration-500 ${
        isOpen
          ? 'opacity-100 pointer-events-auto translate-y-0'
          : 'opacity-0 pointer-events-none translate-y-4'
      }`}
    >
      {/* Top Header Bar */}
      <header className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between border-b border-white/[0.08] shrink-0">
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Back Button '<' */}
          <button
            onClick={onClose}
            aria-label="Back to tunnel journey"
            className="group flex items-center justify-center w-8 h-8 rounded-lg bg-white/[0.04] hover:bg-white/[0.1] border border-white/10 hover:border-white/25 text-white/80 hover:text-white transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-white/30 cursor-pointer"
          >
            <span className="font-mono text-sm leading-none font-medium select-none">&lt;</span>
          </button>
          <div className="h-4 w-[1px] bg-white/10 hidden sm:block" />

          {/* Title & Grounding Hint */}
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display font-medium text-base sm:text-lg text-white tracking-tight">
                DevDocs AI
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-white/[0.06] text-white/80 border border-white/10">
                RAG
              </span>
            </div>
            <p className="text-xs text-white/50 font-mono tracking-tight hidden sm:block">
              Ask about the docs — answers stay grounded in sources
            </p>
          </div>
        </div>

        {/* Right Tools: Clear & ESC Hint */}
        <div className="flex items-center gap-4">
          {messages.length > 0 && (
            <button
              onClick={handleClearHistory}
              className="text-white/40 hover:text-white font-mono text-[11px] uppercase tracking-wider transition-colors cursor-pointer"
            >
              Clear Thread
            </button>
          )}
          <div className="font-mono text-[10px] text-white/35 uppercase tracking-widest hidden sm:block">
            PRESS ESC TO RETURN
          </div>
        </div>
      </header>

      {/* Main Thread Area (scrollable) */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 overflow-y-auto space-y-6">
        {/* Empty State */}
        {messages.length === 0 && !isLoading && (
          <div className="h-full min-h-[340px] flex flex-col items-center justify-center text-center p-6 sm:p-8">
            <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/15 flex items-center justify-center text-white mb-5 shadow-[inset_0_0_20px_rgba(255,255,255,0.03)]">
              <svg className="w-6 h-6 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.6"
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
            </div>
            <h3 className="font-display font-medium text-2xl sm:text-3xl text-white tracking-tight mb-2">
              Ground your inquiries in official documentation
            </h3>
            <p className="text-white/60 text-xs sm:text-sm max-w-md mb-8 leading-relaxed font-light">
              Query cross-indexed FastAPI and React corpora. Every synthesized response derives strictly from indexed technical sections with verifiable links.
            </p>

            {/* Try prompt chips */}
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-xl">
              <button
                onClick={() => {
                  setInputVal('How do I use Depends in FastAPI?');
                  setSelectedTech('fastapi');
                  handleExecute('How do I use Depends in FastAPI?');
                }}
                className="w-full sm:w-auto flex-1 px-4 py-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:border-white/30 text-xs text-left text-white/80 hover:text-white transition-all duration-200 flex items-center justify-between group cursor-pointer"
              >
                <span className="font-mono">“How do I use Depends in FastAPI?”</span>
                <span className="text-white/40 group-hover:text-white group-hover:translate-x-0.5 transition-all font-mono">
                  →
                </span>
              </button>
              <button
                onClick={() => {
                  setInputVal('What does the useEffect dependency array control?');
                  setSelectedTech('react');
                  handleExecute('What does the useEffect dependency array control?');
                }}
                className="w-full sm:w-auto flex-1 px-4 py-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:border-white/30 text-xs text-left text-white/80 hover:text-white transition-all duration-200 flex items-center justify-between group cursor-pointer"
              >
                <span className="font-mono">“useEffect dependency array”</span>
                <span className="text-white/40 group-hover:text-white group-hover:translate-x-0.5 transition-all font-mono">
                  →
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Messages List */}
        {messages.map((msg) => (
          <div key={msg.id}>
            {msg.role === 'user' ? (
              <div className="flex justify-end">
                <div className="max-w-[85%] sm:max-w-[75%] rounded-2xl bg-white/[0.08] border border-white/20 px-5 py-3 text-white font-sans text-sm sm:text-base backdrop-blur-md shadow-lg">
                  <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  <div className="mt-1 flex items-center justify-end gap-2 text-[10px] font-mono text-white/40">
                    <span>{msg.timestamp}</span>
                    {msg.techScope && msg.techScope !== 'all' && (
                      <span className="uppercase text-white/60">[{msg.techScope}]</span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3.5 max-w-3xl">
                <div className="w-8 h-8 rounded-lg bg-white/[0.06] border border-white/20 flex items-center justify-center text-white shrink-0 mt-1 shadow-sm">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>

                <div className="flex-1 p-5 rounded-2xl bg-[#090b10]/95 border border-white/10 backdrop-blur-md shadow-2xl text-white font-sans text-sm sm:text-base">
                  <p className="leading-relaxed whitespace-pre-wrap mb-3 text-white/95">{msg.content}</p>

                  {/* Code snippet if present */}
                  {msg.codeSnippet && (
                    <div className="my-3.5 rounded-xl bg-[#07080c] border border-white/10 overflow-hidden font-mono text-xs">
                      <div className="px-4 py-2 bg-white/[0.03] border-b border-white/[0.08] text-white/50 flex items-center justify-between text-[11px]">
                        <span className="text-white/80">{msg.codeSnippet.filename}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-white/50 uppercase">{msg.codeSnippet.versionBadge}</span>
                          <button
                            onClick={() => handleCopyCode(msg.id, msg.codeSnippet!.code)}
                            className="text-white/60 hover:text-white transition-colors cursor-pointer text-[10px] uppercase font-mono tracking-wider"
                          >
                            {copiedId === msg.id ? 'COPIED ✓' : 'COPY'}
                          </button>
                        </div>
                      </div>
                      <pre className="p-4 text-white/90 overflow-x-auto leading-relaxed">
                        <code>{msg.codeSnippet.code}</code>
                      </pre>
                    </div>
                  )}

                  {/* Verified Sources / Citations Footnotes */}
                  {msg.citations && msg.citations.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-white/[0.08]">
                      <div className="flex items-center gap-2 mb-2.5 text-[11px] font-mono tracking-wider uppercase text-white/40">
                        <svg className="w-3 h-3 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        <span>Footnotes • {msg.citations.length} Verified Sources</span>
                      </div>

                      <ul className="space-y-2">
                        {msg.citations.map((c) => (
                          <li
                            key={c.index}
                            className="flex items-start gap-2.5 p-2.5 rounded-lg bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.07] transition-colors"
                          >
                            <span className="shrink-0 flex items-center justify-center w-5 h-5 rounded bg-white/[0.08] text-white font-mono text-[10px] font-bold border border-white/20">
                              {c.index}
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-sans font-medium text-xs text-white truncate">{c.title}</span>
                                <span className="text-white/30 text-xs">—</span>
                                <span className="text-xs text-white/50 truncate">{c.section}</span>
                              </div>
                              <div className="flex items-center gap-3 mt-1.5">
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono tracking-wider uppercase bg-white/[0.06] text-white/70 border border-white/10">
                                  {c.tech}
                                </span>
                                <button
                                  onClick={() => onInspectCitation(c)}
                                  className="text-[10px] font-mono text-white/70 hover:text-white underline cursor-pointer uppercase tracking-wider"
                                >
                                  Inspect Excerpt
                                </button>
                                <a
                                  href={c.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[10px] font-mono text-white/80 hover:text-white flex items-center gap-1 uppercase tracking-wider"
                                >
                                  <span>Open Docs</span>
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                    />
                                  </svg>
                                </a>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-start gap-3.5 max-w-2xl">
            <div className="w-8 h-8 rounded-lg bg-white/[0.06] border border-white/15 flex items-center justify-center text-white shrink-0 mt-1">
              <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                <path
                  className="opacity-75"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  fill="currentColor"
                />
              </svg>
            </div>
            <div className="flex-1 p-4 rounded-xl bg-[#090b10]/90 border border-white/10 backdrop-blur-md shadow-xl space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-mono text-white/70">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                <span className="tracking-wider uppercase">Retrieving docs and generating…</span>
              </div>
              <div className="h-3 w-3/4 rounded shimmer-editorial" />
              <div className="h-3 w-5/6 rounded shimmer-editorial" />
              <div className="h-3 w-2/5 rounded shimmer-editorial" />
            </div>
          </div>
        )}

        <div ref={threadEndRef} />
      </main>

      {/* Bottom Form Input */}
      <footer className="w-full max-w-4xl mx-auto px-4 sm:px-6 pb-6 pt-2 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleExecute();
          }}
          className="relative rounded-2xl bg-[#090b10]/95 border border-white/15 p-3.5 sm:p-4 backdrop-blur-2xl shadow-[0_12px_40px_rgba(0,0,0,0.85)] transition-all focus-within:border-white/40 focus-within:shadow-[0_0_30px_rgba(255,255,255,0.08)]"
        >
          <textarea
            ref={textareaRef}
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleExecute();
              }
            }}
            placeholder="Ask a question about the documentation..."
            rows={2}
            className="w-full bg-transparent text-white placeholder-white/40 text-sm sm:text-base resize-none focus:outline-none font-sans leading-relaxed"
          />

          <div className="mt-3 pt-3 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              {/* Technology Filter Selector */}
              <div className="relative">
                <select
                  value={selectedTech}
                  onChange={(e) => setSelectedTech(e.target.value as Technology)}
                  className="appearance-none bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white/80 text-xs rounded-lg pl-3 pr-8 py-1.5 focus:outline-none focus:border-white/30 font-mono cursor-pointer transition-colors"
                >
                  <option value="all" className="bg-[#0b0d12] text-white">
                    All technologies
                  </option>
                  {availableTechs.map((tech) => (
                    <option key={tech} value={tech} className="bg-[#0b0d12] text-white">
                      {formatTechLabel(tech)}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white/40">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Explain Code Checkbox */}
              <label className="flex items-center gap-2 cursor-pointer text-xs text-white/60 hover:text-white select-none transition-colors font-mono">
                <input
                  type="checkbox"
                  checked={explainCode}
                  onChange={(e) => setExplainCode(e.target.checked)}
                  className="w-3.5 h-3.5 rounded bg-white/10 border-white/20 text-white focus:ring-0 cursor-pointer accent-white"
                />
                <span>Explain with code</span>
              </label>
            </div>

            {/* Execute Button */}
            <button
              type="submit"
              disabled={!inputVal.trim() || isLoading}
              className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-white hover:bg-white/90 disabled:bg-white/10 disabled:text-white/30 disabled:border-transparent disabled:cursor-not-allowed text-black font-medium text-xs font-mono uppercase tracking-wider transition-all duration-200 focus:outline-none shadow-[0_0_15px_rgba(255,255,255,0.25)] cursor-pointer"
            >
              <span>Execute</span>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        </form>

        <div className="mt-2 text-center">
          <span className="text-[10px] font-mono uppercase tracking-widest text-white/35">
            Grounding index calibrated
            {availableTechs.length > 0
              ? ` • ${availableTechs.length} technologies`
              : ''}
          </span>
        </div>
      </footer>
    </div>
  );
};
