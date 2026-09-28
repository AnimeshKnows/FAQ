import React from 'react';
import { StageThreshold } from '../types';

interface HUDChromeProps {
  scrollProgress: number; // 0 to 1
  currentStage: number; // 0 to 4
  stageThresholds: StageThreshold[];
  onOpenChat: () => void;
  onScrollToStage: (stageIndex: number) => void;
}

export const HUDChrome: React.FC<HUDChromeProps> = ({
  scrollProgress,
  currentStage,
  stageThresholds,
  onOpenChat,
  onScrollToStage,
}) => {
  const pct = Math.min(Math.max(Math.floor(scrollProgress * 100), 0), 100);
  const pctString = `${pct < 10 ? '0' + pct : pct} %`;

  const activeThreshold = stageThresholds[currentStage] || stageThresholds[0];

  return (
    <>
      {/* Hairline Crosshair Corners */}
      <div className="fixed inset-4 sm:inset-6 md:inset-8 pointer-events-none z-30 border border-white/[0.04] hidden sm:block">
        <div className="absolute -top-1.5 -left-1.5 text-white/30 font-mono text-[9px] tracking-widest select-none">+</div>
        <div className="absolute -top-1.5 -right-1.5 text-white/30 font-mono text-[9px] tracking-widest select-none">+</div>
        <div className="absolute -bottom-1.5 -left-1.5 text-white/30 font-mono text-[9px] tracking-widest select-none">+</div>
        <div className="absolute -bottom-1.5 -right-1.5 text-white/30 font-mono text-[9px] tracking-widest select-none">+</div>
      </div>

      {/* Fixed Bottom Telemetry Bar - Pinned to bottom edge with clean dedicated space */}
      <div className="fixed bottom-2.5 sm:bottom-3.5 inset-x-6 sm:inset-x-10 md:inset-x-12 pointer-events-none z-30 flex items-center justify-between">
        {/* Bottom-left coordinate telemetry tag */}
        <div className="font-mono text-[9px] sm:text-[10px] tracking-[0.2em] text-white/45 uppercase flex items-center gap-2">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-white/60 animate-pulse" />
          <span>{activeThreshold.status}</span>
        </div>

        {/* Bottom-right precise coordinate tag */}
        <div className="font-mono text-[9px] sm:text-[10px] tracking-[0.2em] text-white/45 uppercase flex items-center gap-2">
          <span>{activeThreshold.label}</span>
        </div>
      </div>

      {/* Fixed Header: Top-Left Branding — scrim keeps scrolled stage titles from colliding */}
      <header className="fixed top-0 inset-x-0 z-40 pointer-events-none bg-gradient-to-b from-[#040406] via-[#040406]/85 to-transparent pt-5 pb-10 px-5 sm:pt-6 sm:pb-12 sm:px-8 md:pt-8 md:px-10">
        <div className="flex items-center gap-3 max-w-fit pointer-events-auto">
          <div className="w-6 h-6 rounded bg-white/[0.05] border border-white/20 flex items-center justify-center text-white/90 text-xs font-mono shadow-sm shrink-0">
            +
          </div>
          <span className="font-mono font-medium text-xs sm:text-sm tracking-[0.16em] uppercase text-white">
            FRAMEWORK FOR ANSWERING QUESTIONS
          </span>
        </div>
      </header>

      {/* Fixed Vertical Telemetry Dock (Right Rail) */}
      <aside
        aria-label="Page Telemetry"
        className="fixed right-6 sm:right-10 md:right-12 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col items-center gap-5 pointer-events-auto select-none"
      >
        <div className="font-mono text-[10px] tracking-[0.22em] text-white/60 uppercase">
          {pctString}
        </div>

        {/* Vertical Track with sliding tracer pill */}
        <div className="w-[1px] h-36 bg-white/10 relative my-1 overflow-hidden rounded-full">
          <div
            className="w-full bg-white transition-all duration-75 absolute top-0 shadow-[0_0_12px_#ffffff]"
            style={{ height: `${pct}%` }}
          />
        </div>

        {/* Chapter Anchors */}
        <div className="flex flex-col gap-3 font-mono text-[10px] tracking-wider text-white/35">
          {[0, 1, 2, 3].map((stageIdx) => {
            const isActive = Math.min(currentStage, 3) === stageIdx;
            return (
              <button
                key={stageIdx}
                onClick={() => onScrollToStage(stageIdx)}
                className={`transition-all duration-200 cursor-pointer flex items-center gap-2 group text-left ${
                  isActive ? 'text-white font-medium' : 'text-white/35 hover:text-white'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full transition-all group-hover:scale-125 ${
                    isActive ? 'bg-white' : 'bg-transparent group-hover:bg-white'
                  }`}
                />
                <span>0{stageIdx + 1}</span>
              </button>
            );
          })}
        </div>
      </aside>
    </>
  );
};
