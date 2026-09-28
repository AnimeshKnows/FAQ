import React from 'react';
import { Citation } from '../types';

interface CitationDrawerProps {
  citation: Citation | null;
  onClose: () => void;
}

export const CitationDrawer: React.FC<CitationDrawerProps> = ({ citation, onClose }) => {
  if (!citation) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl bg-[#090b10] border border-white/20 p-6 sm:p-8 shadow-[0_20px_70px_rgba(0,0,0,0.95)] text-white">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4 mb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded bg-white/10 border border-white/20 flex items-center justify-center text-xs font-mono font-bold text-white">
                {citation.index}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-white/[0.06] text-white/80 border border-white/15">
                {citation.tech}
              </span>
              <span className="font-mono text-[10px] tracking-wider text-emerald-400">
                [ VERIFIED SOURCE ]
              </span>
            </div>
            <h3 className="font-display font-medium text-xl text-white tracking-tight pt-1">
              {citation.title}
            </h3>
            <p className="font-mono text-xs text-white/50">{citation.section}</p>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/[0.05] hover:bg-white/[0.15] border border-white/10 flex items-center justify-center text-white/60 hover:text-white font-mono text-base transition-colors cursor-pointer"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <div>
            <h4 className="font-mono text-[11px] uppercase tracking-wider text-white/40 mb-1.5">
              Corpus Excerpt & Grounding
            </h4>
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 font-sans text-sm text-white/80 leading-relaxed font-light">
              {citation.summary}
            </div>
          </div>

          <div>
            <h4 className="font-mono text-[11px] uppercase tracking-wider text-white/40 mb-1.5">
              Canonical Documentation URI
            </h4>
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.08] font-mono text-xs text-white/70 overflow-hidden">
              <span className="truncate pr-4">{citation.url}</span>
              <a
                href={citation.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 rounded bg-white hover:bg-white/90 text-black font-semibold text-[11px] tracking-wider uppercase flex items-center gap-1.5 shrink-0 transition-colors"
              >
                <span>Visit Docs</span>
                <span>↗</span>
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-white/[0.08] flex items-center justify-between font-mono text-[10px] text-white/40 uppercase tracking-wider">
          <span>
            {citation.chunk_id
              ? `CHUNK: ${citation.chunk_id}`
              : `SOURCE REF ${citation.index}`}
            {typeof citation.score === 'number' ? ` • SCORE ${citation.score.toFixed(3)}` : ''}
          </span>
          <button
            onClick={onClose}
            className="hover:text-white underline underline-offset-2 cursor-pointer"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
