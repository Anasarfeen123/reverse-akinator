import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Settings, Cpu } from 'lucide-react';
import { PitchInteractiveCanvas } from './components/PitchInteractiveCanvas';
import { MatchArena } from './components/MatchArena';
import { PlayerRevealCard } from './components/PlayerRevealCard';
import { ModelSettingsModal } from './components/ModelSettingsModal';
import { startGame } from './services/api';
import { getSavedModelConfig, type ModelConfig, PROVIDER_MODELS } from './services/modelConfig';

type GamePhase = 'KICKOFF' | 'STARTING_MATCH' | 'MATCH' | 'FULL_TIME';
type ResultView = 'result' | 'chat';

function App() {
  const [phase, setPhase] = useState<GamePhase>('KICKOFF');
  const [matchId, setMatchId] = useState<string | null>(null);
  const [matchResult, setMatchResult] = useState<{ isWin: boolean; actualPlayer?: string } | null>(null);
  const [resultView, setResultView] = useState<ResultView>('result');

  // Model & API Settings State
  const [modelConfig, setModelConfig] = useState<ModelConfig>(getSavedModelConfig());
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleGoalScored = async () => {
    setPhase('STARTING_MATCH');
    try {
      const response = await startGame(modelConfig);
      setMatchId(response.matchId);
      setPhase('MATCH');
    } catch (error) {
      console.error('Failed to start match', error);
      setPhase('KICKOFF');
    }
  };

  const handleMatchEnd = (result: { isWin: boolean; actualPlayer?: string }) => {
    setMatchResult(result);
    setResultView('result');
    setPhase('FULL_TIME');
  };

  const handleReset = () => {
    setPhase('KICKOFF');
    setMatchId(null);
    setMatchResult(null);
    setResultView('result');
  };

  const currentProviderLabel = PROVIDER_MODELS[modelConfig.provider]?.label || modelConfig.provider;

  const renderPhase = () => {
    switch (phase) {
      // ─── Intro Screen ────────────────────────────────────────────────────────
      case 'KICKOFF':
        return (
          <motion.div key="kickoff" className="absolute inset-0 z-10 w-full h-full pointer-events-none">
            {/* Player Art Images */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 0.4, x: 0 }}
              transition={{ duration: 2, ease: 'easeOut' }}
              className="absolute left-[-5%] bottom-[-5%] w-[45vw] max-w-[600px] aspect-square pointer-events-none z-10 mix-blend-screen opacity-40"
            >
              <img src="/player_10.png" alt="Number 10" className="w-full h-full object-contain [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 0.4, x: 0 }}
              transition={{ duration: 2, ease: 'easeOut' }}
              className="absolute right-[-5%] bottom-[-5%] w-[45vw] max-w-[600px] aspect-square pointer-events-none z-10 mix-blend-screen opacity-40"
            >
              <img src="/player_7.png" alt="Number 7" className="w-full h-full object-contain [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
            </motion.div>

            <div className="absolute inset-0 z-20 pointer-events-auto">
              <PitchInteractiveCanvas onGoalScored={handleGoalScored} />
            </div>

            <motion.div
              initial={{ opacity: 0, filter: 'blur(20px)', y: -30 }}
              animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              className="absolute inset-0 z-30 flex flex-col items-center justify-start pt-44 sm:pt-48 md:pt-52 pointer-events-none px-4"
            >
              {/* Main Game Title */}
              <div className="flex flex-col items-center select-none">
                <h1 className="font-display text-[3.2rem] sm:text-[4.8rem] md:text-[6.5rem] leading-none font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400 tracking-tighter uppercase drop-shadow-2xl">
                  REVERSE
                </h1>
                <h1 className="font-display text-[2.8rem] sm:text-[4.2rem] md:text-[5.8rem] leading-[0.85] font-black text-transparent bg-clip-text bg-gradient-to-b from-emerald-400 to-teal-800 tracking-tighter uppercase drop-shadow-[0_0_35px_rgba(52,211,153,0.35)]">
                  AKINATOR
                </h1>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 1 }}
                className="mt-4 sm:mt-6 flex flex-col items-center gap-3 pointer-events-auto"
              >
                {/* Official Branding Banner displaying both Reverse Akinator Logo & MIC Club Logo */}
                <div className="flex items-center gap-2.5 sm:gap-4 px-3.5 sm:px-5 py-2 rounded-2xl bg-slate-900/95 border-2 border-stadium-gold/60 shadow-[0_0_25px_rgba(212,175,55,0.3)] backdrop-blur-md hover:scale-105 transition">
                  <img
                    src="/reverse_akinator_logo.png"
                    alt="Reverse Akinator FIFA Edition"
                    className="h-10 sm:h-12 w-auto object-contain rounded-xl border border-emerald-500/50 shadow-md bg-slate-950 p-1"
                  />
                  <div className="w-px h-7 bg-slate-700" />
                  <div className="flex items-center gap-2">
                    <img
                      src="/mic_logo.png"
                      alt="MIC Club Logo"
                      className="w-10 sm:w-12 h-10 sm:h-12 object-contain rounded-xl border border-stadium-gold/60 shadow-md bg-slate-950 p-1"
                    />
                    <div className="flex flex-col text-left">
                      <span className="text-[9px] uppercase font-semibold text-slate-400 tracking-wider">Official Game By</span>
                      <span className="text-xs sm:text-sm font-black uppercase tracking-widest text-stadium-gold drop-shadow-md">
                        MIC Club
                      </span>
                    </div>
                  </div>
                </div>

                {/* Strike Ball Prompt */}
                <div className="mt-1 flex flex-col items-center gap-1">
                  <p className="font-sans text-xs sm:text-sm text-slate-300 font-medium tracking-[0.25em] uppercase flex items-center gap-2 bg-slate-900/80 px-4 py-1.5 rounded-full border border-slate-800 shadow-md">
                    ⚽ Drag & Strike the Ball into the Net
                  </p>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        );

      // ─── Loading Screen ───────────────────────────────────────────────────────
      case 'STARTING_MATCH':
        return (
          <motion.div key="starting" className="absolute inset-0 z-30 w-full h-full flex items-center justify-center bg-slate-950/80 backdrop-blur-sm">
            <div className="font-display text-5xl text-stadium-gold animate-pulse tracking-widest uppercase text-center px-4">
              Preparing the Pitch...
              <div className="text-xs font-sans text-slate-400 tracking-normal normal-case mt-3">
                Using {currentProviderLabel} ({modelConfig.model})
              </div>
            </div>
          </motion.div>
        );

      // ─── Match + Full Time ────────────────────────────────────────────────────
      case 'MATCH':
      case 'FULL_TIME':
        return (
          <motion.div
            key="match"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 w-full h-full z-20 pointer-events-auto"
          >
            {matchId && (
              <MatchArena
                matchId={matchId}
                onMatchEnd={handleMatchEnd}
                isGameOver={phase === 'FULL_TIME'}
                onViewResult={() => setResultView('result')}
                modelConfig={modelConfig}
                onOpenSettings={() => setIsSettingsOpen(true)}
              />
            )}

            <AnimatePresence>
              {phase === 'FULL_TIME' && resultView === 'result' && (
                <motion.div
                  key="result-overlay"
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 40 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  className="absolute inset-0 z-30 w-full h-full overflow-y-auto flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-sm pointer-events-auto py-10"
                >
                  <PlayerRevealCard
                    playerName={matchResult?.actualPlayer || 'Unknown Player'}
                    isWin={matchResult?.isWin ?? false}
                    onReset={handleReset}
                    onBackToChat={() => setResultView('chat')}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col relative overflow-hidden font-sans selection:bg-pitch-grass-secondary">
      {/* Background Texture Overlay */}
      <div className="absolute inset-0 bg-pitch-grain pointer-events-none z-0 opacity-20" />

      {/* Abstract Artistic Background Blobs (Optimized for smooth 60fps performance) */}
      <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] bg-radial from-emerald-600/15 via-emerald-900/5 to-transparent rounded-full pointer-events-none z-0 opacity-70 will-change-transform" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[70vw] h-[70vw] max-w-[1000px] max-h-[1000px] bg-radial from-teal-800/20 via-slate-900/5 to-transparent rounded-full pointer-events-none z-0 opacity-80 will-change-transform" />
      <div className="absolute top-[30%] left-[30%] w-[40vw] h-[40vw] max-w-[600px] max-h-[600px] bg-radial from-amber-500/10 via-slate-950/0 to-transparent rounded-full pointer-events-none z-0 opacity-50 will-change-transform" />

      {/* Top Fixed Floating Badges (Only visible on Kickoff screen to prevent overlapping MatchArena header) */}
      {phase === 'KICKOFF' && (
        <>
          <div className="fixed top-4 left-4 z-50 pointer-events-auto flex items-center gap-3 px-3.5 py-2 rounded-2xl bg-slate-900/95 border-2 border-slate-700/80 hover:border-stadium-gold/60 backdrop-blur-md shadow-2xl transition">
            <img src="/reverse_akinator_logo.png" alt="Reverse Akinator Logo" className="h-8 sm:h-10 w-auto object-contain rounded-lg" />
            <div className="w-px h-7 bg-slate-700" />
            <div className="flex items-center gap-2">
              <img src="/mic_logo.png" alt="MIC Club Logo" className="w-8 sm:w-10 h-8 sm:h-10 object-contain rounded-xl border border-stadium-gold/40 shadow-md bg-slate-950 p-0.5" />
              <span className="hidden sm:inline text-xs font-black uppercase tracking-widest text-stadium-gold">MIC Club</span>
            </div>
          </div>

          <div className="fixed top-5 right-5 z-50 pointer-events-auto">
            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/90 border border-slate-700/80 hover:border-emerald-500 backdrop-blur-md text-xs font-medium text-slate-200 transition shadow-2xl hover:scale-105 group"
              title="Change AI Model & Online API Keys"
            >
              <Cpu className="w-4 h-4 text-emerald-400 group-hover:rotate-12 transition" />
              <span className="hidden sm:inline text-slate-400 font-bold">{currentProviderLabel}:</span>
              <span className="text-emerald-400 font-mono font-semibold">{modelConfig.model}</span>
              <Settings className="w-4 h-4 text-slate-400 group-hover:text-emerald-400 ml-1" />
            </button>
          </div>
        </>
      )}

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col z-10 w-full mx-auto relative pointer-events-none">
        <AnimatePresence mode="wait">
          {renderPhase()}
        </AnimatePresence>
      </main>

      {/* Model & API Key Settings Modal */}
      <ModelSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={modelConfig}
        onSaveConfig={(newConfig) => setModelConfig(newConfig)}
      />
    </div>
  );
}

export default App;
