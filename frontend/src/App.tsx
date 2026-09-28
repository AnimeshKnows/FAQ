import { useState, useEffect, useCallback } from 'react';
import { TunnelCanvas } from './components/TunnelCanvas';
import { HUDChrome } from './components/HUDChrome';
import { ScrollyJourney } from './components/ScrollyJourney';
import { ChatOverlay } from './components/ChatOverlay';
import { CitationDrawer } from './components/CitationDrawer';
import { BenchmarkQuery, Citation, StageThreshold, Technology } from './types';

const STAGE_THRESHOLDS: StageThreshold[] = [
  {
    start: 0.0,
    end: 0.18,
    index: 0,
    label: 'ENG.04 // CORPUS REF: 2025.1 [PORTAL]',
    status: 'TUNNEL ENTRANCE // DETERMINISTIC RETRIEVAL',
  },
  {
    start: 0.18,
    end: 0.44,
    index: 1,
    label: 'RAG.02 // HYBRID FAISS+BM25 [WARP]',
    status: 'CAPABILITY MATRIX // MULTI-TIER RETRIEVAL',
  },
  {
    start: 0.44,
    end: 0.72,
    index: 2,
    label: 'SYNTH.03 // PROMPT DISPATCH [NODES]',
    status: 'BENCHMARK QUERIES // SELECTIVE CACHING',
  },
  {
    start: 0.72,
    end: 0.9,
    index: 3,
    label: 'TRUST.04 // STRICT ZERO-HALLUCINATION',
    status: 'VERIFICATION MATRIX // MATHEMATICAL GROUNDING',
  },
  {
    start: 0.9,
    end: 1.0,
    index: 4,
    label: 'GATEWAY.05 // SPEC: RUNTIME ACTIVE',
    status: 'DESTINATION GATEWAY // SYSTEM SPECIFICATION',
  },
];

export default function App() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState(0);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeBenchmarkPrompt, setActiveBenchmarkPrompt] = useState<string | undefined>();
  const [activeBenchmarkTech, setActiveBenchmarkTech] = useState<Technology>('all');
  const [inspectedCitation, setInspectedCitation] = useState<Citation | null>(null);

  // Monitor window scroll to update progress and active scrolly stage
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.pageYOffset || document.documentElement.scrollTop;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = maxScroll > 0 ? Math.min(Math.max(scrollY / maxScroll, 0), 1) : 0;
      setScrollProgress(progress);

      // Determine stage
      const matchingStage = STAGE_THRESHOLDS.find(
        (t) => progress >= t.start && progress <= t.end
      );
      if (matchingStage) {
        setCurrentStage(matchingStage.index);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleScrollToStage = useCallback((stageIndex: number) => {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const targetThreshold = STAGE_THRESHOLDS[stageIndex] || STAGE_THRESHOLDS[0];
    const targetP = targetThreshold.start + 0.05;

    window.scrollTo({
      top: maxScroll * targetP,
      behavior: 'smooth',
    });
  }, []);

  const handleOpenChat = useCallback(() => {
    setActiveBenchmarkPrompt(undefined);
    setIsChatOpen(true);
  }, []);

  const handleLaunchBenchmark = useCallback((bm: BenchmarkQuery) => {
    setActiveBenchmarkPrompt(bm.prompt);
    setActiveBenchmarkTech(bm.tech);
    setIsChatOpen(true);
  }, []);

  return (
    <div className="relative w-full min-h-screen bg-[#040406] text-[#e3e2e6] font-sans selection:bg-white selection:text-black">
      {/* Fixed 3D Hyperspace Warp Tunnel Canvas */}
      <TunnelCanvas
        scrollProgress={scrollProgress}
        onCoreClick={handleOpenChat}
      />

      {/* Fixed Editorial HUD Chrome & Telemetry */}
      <HUDChrome
        scrollProgress={scrollProgress}
        currentStage={currentStage}
        stageThresholds={STAGE_THRESHOLDS}
        onOpenChat={handleOpenChat}
        onScrollToStage={handleScrollToStage}
      />

      {/* Virtual Scroll Height Track to drive 3D scrub */}
      <div className="relative w-full h-[520vh]">
        {/* Scrollytelling Stage Presentation pinned to viewport */}
        <ScrollyJourney
          currentStage={currentStage}
          onOpenChat={handleOpenChat}
          onLaunchBenchmark={handleLaunchBenchmark}
          onScrollToStage={handleScrollToStage}
        />
      </div>

      {/* Full-Viewport Frosted Glass Editorial Chat Overlay */}
      <ChatOverlay
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        initialPrompt={activeBenchmarkPrompt}
        initialTech={activeBenchmarkTech}
        onInspectCitation={(c) => setInspectedCitation(c)}
      />

      {/* Citation Inspector Modal */}
      <CitationDrawer
        citation={inspectedCitation}
        onClose={() => setInspectedCitation(null)}
      />
    </div>
  );
}
