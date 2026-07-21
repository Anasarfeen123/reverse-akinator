import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Settings, Cpu, Play, Trophy, Target, BrainCircuit, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
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
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:72px_72px] opacity-15" />

            <motion.div
              initial={{ opacity: 0, x: -40, scale: 0.98 }}
              animate={{ opacity: 0.35, x: 0, scale: 1 }}
              transition={{ duration: 2.2, ease: 'easeOut' }}
              className="absolute left-[-8%] bottom-[-10%] w-[38vw] max-w-[560px] aspect-square pointer-events-none z-10 mix-blend-screen opacity-35"
            >
              <img src="/player_10.png" alt="Number 10" className="w-full h-full object-contain [mask-image:radial-gradient(ellipse_at_center,black,transparent_72%)]" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 40, scale: 0.98 }}
              animate={{ opacity: 0.32, x: 0, scale: 1 }}
              transition={{ duration: 2.2, ease: 'easeOut' }}
              className="absolute right-[-7%] bottom-[-8%] w-[40vw] max-w-[620px] aspect-square pointer-events-none z-10 mix-blend-screen opacity-30"
            >
              <img src="/player_7.png" alt="Number 7" className="w-full h-full object-contain [mask-image:radial-gradient(ellipse_at_center,black,transparent_72%)]" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30, filter: 'blur(18px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 1.1, ease: 'easeOut' }}
              className="absolute inset-0 z-30 flex items-center justify-center px-4 py-8 sm:py-10"
            >
              <div className="w-full max-w-7xl grid lg:grid-cols-[1.05fr_0.95fr] gap-5 sm:gap-6 items-center pointer-events-none">
                <div className="pointer-events-auto flex flex-col gap-5 sm:gap-6">
                  <div className="inline-flex items-center gap-2 self-start px-3 py-1.5 rounded-full border border-emerald-400/30 bg-emerald-950/60 text-[11px] font-bold uppercase tracking-[0.28em] text-emerald-300 shadow-[0_0_24px_rgba(16,185,129,0.15)] backdrop-blur-md">
                    <Sparkles className="w-3.5 h-3.5" />
                    Tactical LLM Football Guessing Game
                  </div>

                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-3 py-1 rounded-full border border-slate-700 bg-slate-900/80 text-[11px] uppercase tracking-[0.25em] text-slate-300">Reverse Akinator</span>
                      <span className="px-3 py-1 rounded-full border border-stadium-gold/30 bg-stadium-gold/10 text-[11px] uppercase tracking-[0.25em] text-stadium-gold">Football Edition</span>
                    </div>
                    <h1 className="max-w-2xl font-display text-[3.45rem] leading-[0.82] sm:text-[5.3rem] lg:text-[6.9rem] font-black tracking-tighter uppercase text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-slate-400 drop-shadow-2xl">
                      Reverse
                      <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-400 to-stadium-gold drop-shadow-[0_0_40px_rgba(52,211,153,0.28)]">
                        Akinator
                      </span>
                    </h1>
                    <p className="max-w-xl text-sm sm:text-base lg:text-lg text-slate-300 leading-relaxed">
                      Strike the ball to start the match, interrogate the AI referee, and corner the secret player with sharp football logic.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { icon: BrainCircuit, label: 'LLM referee', value: 'multi-provider' },
                      { icon: Target, label: 'Win condition', value: 'identify the player' },
                      { icon: ShieldCheck, label: 'Fact engine', value: 'hard rule checks' },
                    ].map(({ icon: Icon, label, value }) => (
                      <div key={label} className="rounded-2xl border border-slate-800/80 bg-slate-950/75 backdrop-blur-md px-4 py-3 shadow-[0_0_24px_rgba(2,6,23,0.25)]">
                        <Icon className="w-4 h-4 text-emerald-400 mb-2" />
                        <div className="text-[11px] uppercase tracking-[0.24em] text-slate-500">{label}</div>
                        <div className="mt-1 text-sm font-semibold text-slate-100">{value}</div>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pointer-events-auto">
                    <div className="inline-flex items-center gap-2 rounded-2xl border border-stadium-gold/40 bg-slate-950/80 px-4 py-3 backdrop-blur-md shadow-[0_0_28px_rgba(212,175,55,0.12)]">
                      <img
                        src="/reverse_akinator_logo.png"
                        alt="Reverse Akinator Logo"
                        className="h-10 w-auto rounded-xl border border-emerald-500/40 bg-slate-950 p-1"
                      />
                      <div className="h-9 w-px bg-slate-700" />
                      <div className="flex items-center gap-2">
                        <img
                          src="/mic_logo.png"
                          alt="MIC Club Logo"
                          className="w-10 h-10 object-contain rounded-xl border border-stadium-gold/50 bg-slate-950 p-1"
                        />
                        <div className="flex flex-col">
                          <span className="text-[9px] uppercase font-semibold text-slate-400 tracking-[0.26em]">Official Game By</span>
                          <span className="text-xs font-black uppercase tracking-[0.22em] text-stadium-gold">MIC Club</span>
                        </div>
                      </div>
                    </div>

                    <div className="inline-flex items-center gap-3 rounded-2xl border border-emerald-400/30 bg-emerald-950/40 px-4 py-3 backdrop-blur-md text-slate-200">
                      <Play className="w-4 h-4 text-emerald-300" />
                      <div className="text-sm">
                        <div className="font-semibold text-white">Drag the ball to kick off</div>
                        <div className="text-xs text-slate-400">Then switch to interrogation mode and ask smart questions.</div>
                      </div>
                    </div>
                  </div>

                  <div className="pointer-events-auto rounded-[1.5rem] border border-slate-800/80 bg-slate-950/75 px-4 py-4 backdrop-blur-md shadow-[0_0_24px_rgba(2,6,23,0.25)]">
                    <div className="text-[10px] uppercase tracking-[0.3em] text-slate-500">35-player roster loaded</div>
                    <div className="mt-1 text-sm font-semibold text-white">No spoilers on the main screen.</div>
                    <div className="mt-2 text-xs text-slate-400 leading-relaxed">
                      Kick off the ball to start the interrogation, then reveal one player only at the end of the match.
                    </div>
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
                      <div className="absolute inset-x-4 bottom-4 rounded-2xl border border-slate-700/80 bg-slate-950/85 backdrop-blur-md px-4 py-3 text-sm text-slate-200 shadow-2xl">
                        <div className="flex items-center gap-2 font-semibold text-stadium-gold">
                          <ArrowRight className="w-4 h-4" />
                          How it works
                        </div>
                        <div className="mt-1 text-xs sm:text-sm text-slate-400 leading-relaxed">
                          Strike the ball to launch the match, then use the model settings if you want to switch providers or keys.
                        </div>
                      </div>
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
                  <BrainCircuit className="w-3.5 h-3.5" />
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
