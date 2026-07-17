import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { PitchInteractiveCanvas } from './components/PitchInteractiveCanvas';
import { MatchArena } from './components/MatchArena';
import { PlayerRevealCard } from './components/PlayerRevealCard';
import { startGame } from './services/api';

type GamePhase = 'KICKOFF' | 'STARTING_MATCH' | 'MATCH' | 'FULL_TIME';
type ResultView = 'result' | 'chat';

function App() {
  const [phase, setPhase] = useState<GamePhase>('KICKOFF');
  const [matchId, setMatchId] = useState<string | null>(null);
  const [matchResult, setMatchResult] = useState<{ isWin: boolean; actualPlayer?: string } | null>(null);
  // Controls whether we're looking at the result card or the chat log in FULL_TIME
  const [resultView, setResultView] = useState<ResultView>('result');
  const [startError, setStartError] = useState<string | null>(null);

  const handleGoalScored = async () => {
    if (phase === 'STARTING_MATCH') return;
    setStartError(null);
    setPhase('STARTING_MATCH');
    try {
      const response = await startGame();
      setMatchId(response.matchId);
      setPhase('MATCH');
    } catch (error) {
      console.error('Failed to start match', error);
      setStartError(
        'Could not reach the game server. Make sure the backend is running (npm run dev:all).'
      );
      setPhase('KICKOFF');
    }
  };

  const handleMatchEnd = (result: { isWin: boolean; actualPlayer?: string }) => {
    setMatchResult(result);
    setResultView('result'); // always open the result card first
    setPhase('FULL_TIME');
  };

  const handleReset = () => {
    setPhase('KICKOFF');
    setMatchId(null);
    setMatchResult(null);
    setResultView('result');
  };

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

            <button
              type="button"
              onClick={handleGoalScored}
              aria-label="Start game"
              className="absolute inset-0 z-20 pointer-events-auto cursor-pointer bg-transparent"
            >
              <PitchInteractiveCanvas onGoalScored={handleGoalScored} />
            </button>

            <motion.div
              initial={{ opacity: 0, filter: 'blur(20px)', y: -50 }}
              animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
              className="absolute inset-0 z-30 flex flex-col items-center justify-start pt-24 md:pt-32 pointer-events-none"
            >
              <h1 className="font-display text-[6rem] md:text-[10rem] leading-none font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-500 tracking-tighter uppercase drop-shadow-2xl">
                REVERSE
              </h1>
              <h1 className="font-display text-[5rem] md:text-[9rem] leading-[0.8] font-black text-transparent bg-clip-text bg-gradient-to-b from-emerald-400 to-teal-900 tracking-tighter uppercase drop-shadow-[0_0_40px_rgba(52,211,153,0.3)]">
                AKINATOR
              </h1>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 1.5 }}
                className="mt-16 flex flex-col items-center gap-4"
              >
                <div className="w-12 h-[1px] bg-stadium-gold/50" />
                <p className="font-sans text-sm md:text-lg text-slate-400 font-light tracking-[0.3em] uppercase">
                  Tap anywhere or strike the ball to begin
                </p>
                {startError && (
                  <p className="mt-4 max-w-md px-6 text-center font-sans text-sm text-rose-400">
                    {startError}
                  </p>
                )}
                <div className="w-12 h-[1px] bg-stadium-gold/50" />
              </motion.div>
            </motion.div>
          </motion.div>
        );

      // ─── Loading Screen ───────────────────────────────────────────────────────
      case 'STARTING_MATCH':
        return (
          <motion.div key="starting" className="absolute inset-0 z-30 w-full h-full flex items-center justify-center bg-slate-950/80 backdrop-blur-sm">
            <div className="font-display text-5xl text-stadium-gold animate-pulse tracking-widest uppercase">
              Preparing the Pitch...
            </div>
          </motion.div>
        );

      // ─── Match + Full Time ────────────────────────────────────────────────────
      // MatchArena stays mounted across both MATCH and FULL_TIME so the chat
      // log is preserved when navigating back from the result card.
      case 'MATCH':
      case 'FULL_TIME':
        return (
          <motion.div
            key="match"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 w-full h-full z-20 pointer-events-auto"
          >
            {/* MatchArena — always mounted; shows "View Result" banner when game over */}
            {matchId && (
              <MatchArena
                matchId={matchId}
                onMatchEnd={handleMatchEnd}
                isGameOver={phase === 'FULL_TIME'}
                onViewResult={() => setResultView('result')}
              />
            )}

            {/* Result card overlay — slides in over the chat when in FULL_TIME */}
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

      {/* Abstract Artistic Background Blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none z-0 mix-blend-screen" style={{ animation: 'pulse 8s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />
      <div className="absolute bottom-[-10%] right-[-10%] w-[70vw] h-[70vw] max-w-[1000px] max-h-[1000px] bg-teal-800/20 rounded-full blur-[150px] pointer-events-none z-0 mix-blend-screen" />
      <div className="absolute top-[30%] left-[30%] w-[40vw] h-[40vw] max-w-[600px] max-h-[600px] bg-stadium-gold/5 rounded-full blur-[100px] pointer-events-none z-0 mix-blend-screen" style={{ animation: 'pulse 12s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col z-10 w-full mx-auto relative pointer-events-none">
        <AnimatePresence mode="wait">
          {renderPhase()}
        </AnimatePresence>
      </main>
    </div>
  );
}

export default App;
