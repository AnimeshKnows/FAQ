import React from 'react';
import { BENCHMARK_QUERIES } from '../data/corpus';
import { BenchmarkQuery, Technology } from '../types';

interface ScrollyJourneyProps {
  currentStage: number; // 0 to 4
  onOpenChat: () => void;
  onLaunchBenchmark: (query: BenchmarkQuery) => void;
  onScrollToStage: (stageIndex: number) => void;
}

export const ScrollyJourney: React.FC<ScrollyJourneyProps> = ({
  currentStage,
  onOpenChat,
  onLaunchBenchmark,
  onScrollToStage,
}) => {
  const getStageClass = (stageIndex: number) => {
    if (stageIndex === currentStage) return 'scrolly-stage active-stage';
    if (stageIndex < currentStage) return 'scrolly-stage passed-stage';
    return 'scrolly-stage';
  };

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-20 flex items-center justify-center">
      {/* ----------------------------------------------------------------- */}
      {/* STAGE 0: ENTRANCE // HERO HORIZON                                 */}
      {/* ----------------------------------------------------------------- */}
      <div className={`${getStageClass(0)} p-6 sm:p-10 md:p-12 justify-between ${currentStage === 0 ? 'pointer-events-auto' : 'pointer-events-none'}`}>
        <div className="w-full max-w-6xl mx-auto pt-16 sm:pt-20" />

        {/* Center Singularity Core Hit Target with Floating Cue */}
        <div className="relative flex flex-col items-center justify-center my-auto pointer-events-auto z-30">
          <div className="relative flex flex-col items-center justify-center">
            {/* Interactive Core Trigger directly over the canvas white singularity core */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenChat();
              }}
              type="button"
              aria-label="Click white singularity core to launch chat"
              title="Click white singularity core to launch chat"
              className="group relative w-60 h-60 md:w-72 md:h-72 rounded-full flex flex-col items-center justify-center focus:outline-none cursor-pointer"
            >
              {/* Floating Pill Tag: only visible when hovered over with the cursor */}
              <div className="absolute bottom-4 md:bottom-6 flex flex-col items-center gap-2 opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100 pointer-events-none group-hover:pointer-events-auto transition-all duration-300 ease-out">
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenChat();
                  }}
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/90 hover:bg-black border border-white/35 hover:border-white/80 text-white font-mono text-[10px] md:text-[11px] uppercase tracking-[0.2em] shadow-[0_0_24px_rgba(255,255,255,0.25)] backdrop-blur-md transition-all cursor-pointer select-none"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                  <span className="font-semibold">CLICK CORE TO LAUNCH CHAT</span>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Bottom Headline & Explore cue with spacious clearance above bottom telemetry bar */}
        <div className="w-full max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-end justify-between gap-6 pointer-events-auto pb-14 sm:pb-16 md:pb-20 lg:pb-24">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-3 text-white/80 font-mono text-xs tracking-[0.16em] uppercase">
              <span className="text-white/40">[ 01 ]</span>
              <span className="tracking-widest">CITATION-AWARE ARCHITECTURE</span>
            </div>
            <h1 className="font-display font-medium text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white tracking-[-0.035em] leading-[1.05] text-glow-singularity mb-3.5">
              Framework for Answering Questions
            </h1>
            <p className="font-sans text-white/70 text-sm sm:text-base leading-relaxed text-readable-editorial max-w-xl font-light tracking-[-0.01em]">
              Grounded technical intelligence over FastAPI and React documentation — authoritative citations you can verify.
            </p>
          </div>

          <button
            onClick={() => onScrollToStage(1)}
            className="group flex items-center gap-3 text-white/40 hover:text-white transition-colors duration-200 font-mono text-xs tracking-widest uppercase self-start sm:self-end pb-1 cursor-pointer shrink-0"
          >
            <span>WARP INTO TUNNEL</span>
            <div className="w-7 h-7 rounded-full border border-white/20 group-hover:border-white/60 flex items-center justify-center transition-all group-hover:translate-y-1">
              <span className="text-[10px]">↓</span>
            </div>
          </button>
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* STAGE 1: CAPABILITY MATRIX                                        */}
      {/* ----------------------------------------------------------------- */}
      <div className={`${getStageClass(1)} p-6 sm:p-10 md:p-12 overflow-y-auto max-h-screen ${currentStage === 1 ? 'pointer-events-auto' : 'pointer-events-none'}`}>
        <div className={`w-full max-w-6xl mx-auto my-auto pt-24 sm:pt-28 md:pt-32 pb-20 flex flex-col justify-center ${currentStage === 1 ? 'pointer-events-auto' : 'pointer-events-none'}`}>
          {/* Section Header */}
          <div className="w-full flex items-center justify-between border-t border-white/10 pt-5 mb-8">
            <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-white/70">
              <span className="text-white/30">[ 02 ]</span>
              <span className="text-white font-medium">// CAPABILITY MATRIX</span>
            </div>
            <span className="font-mono text-[10px] text-white/40 uppercase tracking-widest hidden sm:inline">
              DETERMINISTIC RETRIEVAL
            </span>
          </div>

          {/* Headline */}
          <div className="max-w-3xl mb-10">
            <h2 className="font-display font-normal text-3xl sm:text-5xl md:text-6xl text-white tracking-[-0.03em] leading-[1.05] mb-4 text-glow-singularity">
              Ask docs. <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/95 to-white/50">
                Get grounded answers.
              </span>
            </h2>
            <p className="font-sans text-white/65 text-sm sm:text-base leading-relaxed font-light max-w-2xl">
              A deterministic dual-index pipeline fusing dense vector search with precise lexical tokenization, preventing hallucination through strict citation isolation.
            </p>
          </div>

          {/* 3-Step Interactive Perspective Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Step 01 */}
            <div className="rounded-xl border border-white/15 p-6 sm:p-7 tunnel-card">
              <div className="flex items-center justify-between mb-6">
                <span className="font-mono text-2xl text-white/40 font-light">01</span>
                <span className="font-mono text-[10px] uppercase tracking-widest text-white/50 px-2 py-0.5 rounded border border-white/10 bg-white/[0.04]">
                  INPUT
                </span>
              </div>
              <h3 className="font-display font-medium text-lg sm:text-xl text-white mb-2 tracking-tight">Ask</h3>
              <p className="font-sans text-white/65 text-xs sm:text-sm leading-relaxed font-light">
                Type a natural question about FastAPI or React. The system parses structural intent and scopes technical runtime contexts.
              </p>
              <div className="mt-6 pt-4 border-t border-white/[0.08] flex items-center gap-2 font-mono text-[10px] sm:text-[11px] text-white/40">
                <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
                <span>Natural query synthesis</span>
              </div>
            </div>

            {/* Step 02 */}
            <div className="rounded-xl border border-white/15 p-6 sm:p-7 tunnel-card">
              <div className="flex items-center justify-between mb-6">
                <span className="font-mono text-2xl text-white/40 font-light">02</span>
                <span className="font-mono text-[10px] uppercase tracking-widest text-white/50 px-2 py-0.5 rounded border border-white/10 bg-white/[0.04]">
                  HYBRID RAG
                </span>
              </div>
              <h3 className="font-display font-medium text-lg sm:text-xl text-white mb-2 tracking-tight">Retrieve</h3>
              <p className="font-sans text-white/65 text-xs sm:text-sm leading-relaxed font-light">
                The framework finds the most relevant documentation chunks using FAISS semantic embeddings combined with BM25 keyword reranking.
              </p>
              <div className="mt-6 pt-4 border-t border-white/[0.08] flex items-center gap-2 font-mono text-[10px] sm:text-[11px] text-white/40">
                <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
                <span>bge-reranker calibrated</span>
              </div>
            </div>

            {/* Step 03 */}
            <div className="rounded-xl border border-white/15 p-6 sm:p-7 tunnel-card">
              <div className="flex items-center justify-between mb-6">
                <span className="font-mono text-2xl text-white/40 font-light">03</span>
                <span className="font-mono text-[10px] uppercase tracking-widest text-white/50 px-2 py-0.5 rounded border border-white/10 bg-white/[0.04]">
                  OUTPUT
                </span>
              </div>
              <h3 className="font-display font-medium text-lg sm:text-xl text-white mb-2 tracking-tight">Answer + sources</h3>
              <p className="font-sans text-white/65 text-xs sm:text-sm leading-relaxed font-light">
                Verified explanation backed by direct citations you can open. Direct deep links connect directly to verified sections in official documentation.
              </p>
              <div className="mt-6 pt-4 border-t border-white/[0.08] flex items-center gap-2 font-mono text-[10px] sm:text-[11px] text-white/40">
                <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
                <span>Verifiable URI anchors</span>
              </div>
            </div>
          </div>

          {/* Strict Corpus Guarantee Callout */}
          <div className="mt-8 p-4 sm:p-5 rounded-xl border border-white/20 bg-black/60 backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-white animate-ping" />
              <p className="font-mono text-xs sm:text-sm text-white/90 tracking-wide">
                “Only retrieved documentation is used — not the whole internet, and not guesswork.”
              </p>
            </div>
            <span className="font-mono text-[10px] text-white/50 uppercase tracking-widest shrink-0 sm:border-l sm:border-white/15 sm:pl-4">
              [ STRICT CORPUS GUARANTEE ]
            </span>
          </div>
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* STAGE 2: DEEP TUNNEL NODES // BENCHMARK QUERIES                   */}
      {/* ----------------------------------------------------------------- */}
      <div className={`${getStageClass(2)} p-6 sm:p-10 md:p-12 overflow-y-auto max-h-screen ${currentStage === 2 ? 'pointer-events-auto' : 'pointer-events-none'}`}>
        <div className={`w-full max-w-6xl mx-auto my-auto pt-24 sm:pt-28 md:pt-32 pb-20 flex flex-col justify-center ${currentStage === 2 ? 'pointer-events-auto' : 'pointer-events-none'}`}>
          {/* Section Header */}
          <div className="w-full flex items-center justify-between border-t border-white/10 pt-5 mb-8">
            <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-white/70">
              <span className="text-white/30">[ 03 ]</span>
              <span className="text-white font-medium">// BENCHMARK QUERIES</span>
            </div>
            <span className="font-mono text-[10px] text-white/40 uppercase tracking-widest hidden sm:inline">
              INSTANT DISPATCH
            </span>
          </div>

          {/* Headline */}
          <div className="max-w-2xl mb-8">
            <h2 className="font-display font-normal text-3xl sm:text-5xl md:text-6xl text-white tracking-[-0.03em] mb-3 text-glow-singularity">
              Try these
            </h2>
            <p className="font-sans text-white/65 text-sm sm:text-base leading-relaxed font-light">
              Curated architectural prompts designed to demonstrate multi-tier dependency resolution, asynchronous server flows, and reactive invariants.
            </p>
          </div>

          {/* 6 Interactive Benchmark Query Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {BENCHMARK_QUERIES.map((bm) => (
              <button
                key={bm.id}
                onClick={() => onLaunchBenchmark(bm)}
                className="group text-left p-5 sm:p-6 rounded-xl border border-white/15 tunnel-card hover:bg-white/[0.05] transition-all flex items-start justify-between gap-4 cursor-pointer"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-white/[0.08] text-white/80 border border-white/15">
                      {bm.tag}
                    </span>
                    <span className="font-mono text-[10px] text-white/35 tracking-wider">{bm.ref}</span>
                  </div>
                  <p className="font-mono text-sm text-white/95 group-hover:text-white transition-colors">
                    “{bm.prompt}”
                  </p>
                  <span className="font-sans text-xs text-white/50 block font-light">{bm.description}</span>
                </div>
                <div className="w-7 h-7 rounded-lg border border-white/15 group-hover:border-white/50 flex items-center justify-center text-white/40 group-hover:text-white transition-all group-hover:translate-x-1 shrink-0 font-mono text-xs">
                  →
                </div>
              </button>
            ))}
          </div>

          {/* Guidance Hint */}
          <div className="mt-8 text-center">
            <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-white/50">
              <span>CLICK A QUESTION TO OPEN CHAT</span>
              <span className="text-white/20">—</span>
              <span>OR CLICK THE SINGULARITY CORE ABOVE</span>
            </span>
          </div>
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* STAGE 3: INNER EVENT HORIZON // VERIFICATION MATRIX               */}
      {/* ----------------------------------------------------------------- */}
      <div className={`${getStageClass(3)} p-6 sm:p-10 md:p-12 overflow-y-auto max-h-screen ${currentStage === 3 ? 'pointer-events-auto' : 'pointer-events-none'}`}>
        <div className={`w-full max-w-6xl mx-auto my-auto pt-24 sm:pt-28 md:pt-32 pb-20 flex flex-col justify-center ${currentStage === 3 ? 'pointer-events-auto' : 'pointer-events-none'}`}>
          {/* Section Header */}
          <div className="w-full flex items-center justify-between border-t border-white/10 pt-5 mb-8">
            <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-white/70">
              <span className="text-white/30">[ 04 ]</span>
              <span className="text-white font-medium">// VERIFICATION MATRIX</span>
            </div>
            <span className="font-mono text-[10px] text-white/40 uppercase tracking-widest hidden sm:inline">
              ZERO-HALLUCINATION DISCIPLINE
            </span>
          </div>

          {/* Headline */}
          <div className="max-w-2xl mb-10">
            <h2 className="font-display font-normal text-3xl sm:text-5xl md:text-6xl text-white tracking-[-0.03em] leading-tight mb-4 text-glow-singularity">
              Built for trust, <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/80 to-white/40">
                not vibes
              </span>
            </h2>
            <p className="font-sans text-white/65 text-sm sm:text-base leading-relaxed font-light">
              Large language models fail silently by sounding confident. The Framework for Answering Questions replaces probabilistic guessing with mathematical grounding and verifiable citations.
            </p>
          </div>

          {/* 4-Card Precision Matrix with Corner Crosshairs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="relative p-6 sm:p-7 rounded-xl border border-white/15 tunnel-card">
              <span className="absolute top-2 left-2 text-white/20 font-mono text-[9px]">+</span>
              <span className="absolute top-2 right-2 text-white/20 font-mono text-[9px]">+</span>
              <span className="absolute bottom-2 left-2 text-white/20 font-mono text-[9px]">+</span>
              <span className="absolute bottom-2 right-2 text-white/20 font-mono text-[9px]">+</span>
              <div className="font-mono text-xs uppercase tracking-widest text-white/45 mb-2.5">
                [ M.01 // GROUNDED ]
              </div>
              <h3 className="font-display font-medium text-lg sm:text-xl text-white mb-2">Grounded</h3>
              <p className="font-sans text-white/65 text-xs sm:text-sm leading-relaxed font-light">
                Answers are generated strictly from retrieved docs, not freeform invention or random internet forum speculation.
              </p>
            </div>

            <div className="relative p-6 sm:p-7 rounded-xl border border-white/15 tunnel-card">
              <span className="absolute top-2 left-2 text-white/20 font-mono text-[9px]">+</span>
              <span className="absolute top-2 right-2 text-white/20 font-mono text-[9px]">+</span>
              <span className="absolute bottom-2 left-2 text-white/20 font-mono text-[9px]">+</span>
              <span className="absolute bottom-2 right-2 text-white/20 font-mono text-[9px]">+</span>
              <div className="font-mono text-xs uppercase tracking-widest text-white/45 mb-2.5">
                [ M.02 // CITED ]
              </div>
              <h3 className="font-display font-medium text-lg sm:text-xl text-white mb-2">Cited</h3>
              <p className="font-sans text-white/65 text-xs sm:text-sm leading-relaxed font-light">
                Every reply shows the exact sections used, complete with canonical documentation URLs you can inspect with one click.
              </p>
            </div>

            <div className="relative p-6 sm:p-7 rounded-xl border border-white/15 tunnel-card">
              <span className="absolute top-2 left-2 text-white/20 font-mono text-[9px]">+</span>
              <span className="absolute top-2 right-2 text-white/20 font-mono text-[9px]">+</span>
              <span className="absolute bottom-2 left-2 text-white/20 font-mono text-[9px]">+</span>
              <span className="absolute bottom-2 right-2 text-white/20 font-mono text-[9px]">+</span>
              <div className="font-mono text-xs uppercase tracking-widest text-white/45 mb-2.5">
                [ M.03 // TRANSPARENT ]
              </div>
              <h3 className="font-display font-medium text-lg sm:text-xl text-white mb-2">Honest gaps</h3>
              <p className="font-sans text-white/65 text-xs sm:text-sm leading-relaxed font-light">
                If the indexed corpus doesn't cover a specific nuance, the model states so directly instead of fabricating APIs.
              </p>
            </div>

            <div className="relative p-6 sm:p-7 rounded-xl border border-white/15 tunnel-card">
              <span className="absolute top-2 left-2 text-white/20 font-mono text-[9px]">+</span>
              <span className="absolute top-2 right-2 text-white/20 font-mono text-[9px]">+</span>
              <span className="absolute bottom-2 left-2 text-white/20 font-mono text-[9px]">+</span>
              <span className="absolute bottom-2 right-2 text-white/20 font-mono text-[9px]">+</span>
              <div className="font-mono text-xs uppercase tracking-widest text-white/45 mb-2.5">
                [ M.04 // SELECTIVE ]
              </div>
              <h3 className="font-display font-medium text-lg sm:text-xl text-white mb-2">Tech-aware</h3>
              <p className="font-sans text-white/65 text-xs sm:text-sm leading-relaxed font-light">
                Filter by FastAPI or React when terms like "middleware" or "dependencies" exist in both ecosystems.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* STAGE 4: TERMINAL GATEWAY & SYSTEMS SPEC                          */}
      {/* ----------------------------------------------------------------- */}
      <div className={`${getStageClass(4)} p-6 sm:p-10 md:p-12 overflow-y-auto max-h-screen ${currentStage === 4 ? 'pointer-events-auto' : 'pointer-events-none'}`}>
        <div className={`w-full max-w-6xl mx-auto my-auto pt-24 sm:pt-28 md:pt-32 pb-20 flex flex-col justify-center ${currentStage === 4 ? 'pointer-events-auto' : 'pointer-events-none'}`}>
          {/* Terminal Destination Box */}
          <div className="rounded-2xl border border-white/20 bg-black/85 backdrop-blur-2xl p-8 sm:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.9)] text-white">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start mb-8">
              {/* Left: Brand & Statement */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-medium text-sm tracking-[0.16em] uppercase text-white">
                    FRAMEWORK FOR ANSWERING QUESTIONS
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/10 text-white/90 border border-white/15">
                    v5.4
                  </span>
                </div>
                <p className="font-sans text-white/60 text-xs sm:text-sm leading-relaxed font-light">
                  Citation-aware RAG for technical documentation. Precision engineering over FastAPI and React official corpora.
                </p>
                <div className="pt-2">
                  <button
                    onClick={onOpenChat}
                    className="px-4 py-2 rounded-xl bg-white hover:bg-white/90 text-black font-mono text-xs uppercase tracking-wider font-semibold transition-all duration-200 shadow-[0_0_20px_rgba(255,255,255,0.25)] flex items-center gap-2 cursor-pointer"
                  >
                    <span>Open Knowledge Core</span>
                    <span>→</span>
                  </button>
                </div>
              </div>

              {/* Center: Links */}
              <div className="space-y-3 font-mono text-xs">
                <span className="text-white/40 uppercase tracking-wider text-[10px] block font-semibold">
                  RESOURCES
                </span>
                <div className="flex flex-col gap-2.5 text-white/80">
                  <a
                    href="https://github.com/AnimeshKnows/FAQ"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors flex items-center gap-1.5"
                  >
                    <span>GitHub Repository</span>
                    <span className="text-white/40 text-[10px]">↗</span>
                  </a>
                  <div className="flex items-center gap-2 text-white/60 text-[11px] pt-1">
                    <a
                      href="https://fastapi.tiangolo.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-white underline underline-offset-4 decoration-white/20"
                    >
                      FastAPI docs
                    </a>
                    <span>·</span>
                    <a
                      href="https://react.dev"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-white underline underline-offset-4 decoration-white/20"
                    >
                      React docs
                    </a>
                  </div>
                </div>
              </div>

              {/* Right: Stack Telemetry & Specification */}
              <div className="space-y-3 font-mono text-xs text-white/60">
                <span className="text-white/40 uppercase tracking-wider text-[10px] block font-semibold">
                  ENGINE SPECIFICATION
                </span>
                <p className="leading-relaxed text-[11px] text-white/80">
                  Stack: FastAPI · FAISS · BM25 · bge-reranker · Deterministic Embeddings
                </p>
                <p className="leading-relaxed text-[10px] text-white/45 border-t border-white/[0.08] pt-2.5">
                  Run backend before chatting. Secrets stay in <code className="text-white/80 bg-white/[0.06] px-1 py-0.5 rounded">.env</code> — never in the browser.
                </p>
              </div>
            </div>

            {/* Bottom Line Telemetry */}
            <div className="pt-6 border-t border-white/[0.1] flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[11px] text-white/40">
              <div>© Framework for Answering Questions · Built for learning & portfolio demos</div>
              <div className="flex items-center gap-4 text-[10px] tracking-wider uppercase text-white/60">
                <span>LATENCY: ~180MS</span>
                <span>·</span>
                <span>CHUNK OVERLAP: 64T</span>
                <span>·</span>
                <span>CORPUS: V2025</span>
              </div>
            </div>
          </div>

          {/* Scroll back to top prompt */}
          <div className="mt-6 text-center">
            <button
              onClick={() => onScrollToStage(0)}
              className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-white/50 hover:text-white transition-colors cursor-pointer"
            >
              <span>↑ RETURN TO TUNNEL PORTAL</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
