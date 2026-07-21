import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Settings, Cpu, Play, Trophy } from 'lucide-react';
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
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(31,162,74,0.18),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(212,175,55,0.12),transparent_35%),linear-gradient(180deg,rgba(8,15,28,0.95),rgba(2,6,23,0.98))]" />

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              className="absolute inset-0 z-30 flex items-center justify-center px-4 py-8 sm:py-10"
            >
              <motion.div
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 0.18, x: 0 }}
                transition={{ duration: 1.6, ease: 'easeOut' }}
                className="absolute left-[-6%] bottom-[-6%] w-[28vw] max-w-[420px] aspect-square pointer-events-none mix-blend-screen"
              >
                <img src="/player_10.png" alt="" aria-hidden="true" className="w-full h-full object-contain [mask-image:radial-gradient(ellipse_at_center,black,transparent_72%)]" />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 0.14, x: 0 }}
                transition={{ duration: 1.6, ease: 'easeOut' }}
                className="absolute right-[-5%] bottom-[-4%] w-[30vw] max-w-[440px] aspect-square pointer-events-none mix-blend-screen"
              >
                <img src="/player_7.png" alt="" aria-hidden="true" className="w-full h-full object-contain [mask-image:radial-gradient(ellipse_at_center,black,transparent_72%)]" />
              </motion.div>

              <div className="w-full max-w-7xl grid lg:grid-cols-[1.02fr_0.98fr] gap-6 xl:gap-8 items-center pointer-events-none">
                <div className="pointer-events-auto max-w-3xl mx-auto lg:mx-0 flex flex-col items-center lg:items-start text-center lg:text-left">
                  <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-5 rounded-[2rem] border border-slate-700/80 bg-slate-950/80 px-4 sm:px-6 py-4 shadow-[0_0_30px_rgba(2,6,23,0.22)] backdrop-blur-md">
                    <div className="rounded-[1.6rem] bg-slate-950 border border-slate-700/80 px-5 py-4 shadow-lg">
                      <img src="/reverse_akinator_logo.png" alt="Reverse Akinator Logo" className="h-16 sm:h-20 md:h-24 w-auto object-contain" />
                    </div>
                    <div className="rounded-[1.6rem] bg-white/95 border border-white/80 px-5 py-4 shadow-lg">
                      <img src="/mic-logo.jpg" alt="MIC Club Logo" className="h-16 sm:h-20 md:h-24 w-auto object-contain" />
                    </div>
                  </div>

                  <h1 className="mt-6 font-display text-[3.6rem] leading-[0.82] sm:text-[5.4rem] lg:text-[6.9rem] font-black tracking-tighter uppercase text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-slate-400 drop-shadow-2xl">
                    Reverse
                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-400 to-stadium-gold">
                      Akinator
                    </span>
                  </h1>
                  <p className="mt-5 max-w-2xl text-sm sm:text-base lg:text-lg text-slate-300 leading-relaxed">
                    Strike the ball to start the match and guess the secret player.
                  </p>
                  <div className="mt-6 inline-flex items-center gap-3 rounded-2xl border border-emerald-400/30 bg-emerald-950/40 px-5 py-4 backdrop-blur-md text-slate-200 shadow-[0_0_24px_rgba(16,185,129,0.14)]">
                    <Play className="w-5 h-5 text-emerald-300" />
                    <span className="text-sm sm:text-base font-medium">Drag the ball to kick off.</span>
                  </div>
                </div>

                <div className="pointer-events-auto lg:justify-self-end w-full max-w-2xl">
                  <div className="rounded-[2rem] border border-slate-700/80 bg-slate-950/75 shadow-[0_0_60px_rgba(15,23,42,0.5)] backdrop-blur-xl overflow-hidden">
                    <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-slate-800/80 bg-slate-900/80">
                      <div>
                        <div className="text-[10px] uppercase tracking-[0.3em] text-slate-500">Live Pitch</div>
                        <div className="text-sm font-semibold text-slate-100">Tap or drag to strike the ball</div>
                      </div>
                      <div className="flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-950/40 px-3 py-1 text-xs text-emerald-300">
                        <Trophy className="w-3.5 h-3.5" />
                        Match Ready
                      </div>
                    </div>
                    <div className="relative aspect-[4/5] min-h-[420px] sm:min-h-[520px]">
                      <PitchInteractiveCanvas onGoalScored={handleGoalScored} />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        );

      // ─── Loading Screen ───────────────────────────────────────────────────────
      case 'STARTING_MATCH':
        return (
          <motion.div key="starting" className="absolute inset-0 z-30 w-full h-full flex items-center justify-center bg-slate-950/80 backdrop-blur-sm">
            <div className="w-full max-w-xl mx-auto px-4">
              <div className="rounded-[2rem] border border-slate-800 bg-slate-950/90 backdrop-blur-xl shadow-[0_0_60px_rgba(15,23,42,0.55)] px-6 py-8 text-center">
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-950/40 px-3 py-1 text-[11px] uppercase tracking-[0.28em] text-emerald-300">
                  <Cpu className="w-3.5 h-3.5" />
                  Calibrating referee
                </div>
                <div className="mt-4 font-display text-4xl sm:text-5xl text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-stadium-gold tracking-widest uppercase">
                  Preparing the Pitch
                </div>
                <p className="mt-3 text-sm text-slate-400">
                  Using {currentProviderLabel} <span className="text-slate-200">({modelConfig.model})</span>
                </p>
                <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-slate-800">
                  <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-emerald-400 via-teal-400 to-stadium-gold animate-pulse" />
                </div>
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
                onGoHome={handleReset}
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
                    onGoHome={handleReset}
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

      {/* Top Fixed Settings Control (Only visible on Kickoff screen) */}
      {phase === 'KICKOFF' && (
        <>
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
