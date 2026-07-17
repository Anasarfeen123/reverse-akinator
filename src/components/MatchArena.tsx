import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, AlertCircle, Loader2 } from 'lucide-react';
import { askQuestion, submitGuess } from '../services/api';
import type { AllowedAnswer } from '../types/game';

interface MatchArenaProps {
  matchId: string;
  onMatchEnd: (result: { isWin: boolean; actualPlayer?: string }) => void;
  isGameOver?: boolean;
  onViewResult?: () => void;
}

interface LogEntry {
  id: string;
  question: string;
  answer: AllowedAnswer | null;
}

const getBadgeColorClasses = (answer?: AllowedAnswer | null) => {
  switch (answer) {
    case 'Yes': return 'border-emerald-500 text-emerald-400 bg-emerald-950/80 shadow-[0_0_15px_rgba(16,185,129,0.3)]';
    case 'No': return 'border-rose-500 text-rose-400 bg-rose-950/80 shadow-[0_0_15px_rgba(244,63,94,0.3)]';
    case 'Probably': return 'border-teal-500 text-teal-400 bg-teal-950/80 shadow-[0_0_15px_rgba(20,184,166,0.3)]';
    case 'Probably Not': return 'border-amber-500 text-amber-400 bg-amber-950/80 shadow-[0_0_15px_rgba(245,158,11,0.3)]';
    case "Don't Know": return 'border-slate-500 text-slate-400 bg-slate-900/80 shadow-[0_0_15px_rgba(100,116,139,0.3)]';
    default: return 'border-slate-700 text-slate-300 bg-slate-800/80';
  }
};

export const MatchArena = ({ matchId, onMatchEnd, isGameOver = false, onViewResult }: MatchArenaProps) => {
  const [log, setLog] = useState<LogEntry[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [isGuessMode, setIsGuessMode] = useState(false);
  const [guessCount, setGuessCount] = useState(0);
  const [secretPlayer, setSecretPlayer] = useState<string | undefined>(undefined);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const questionCount = log.length;
  const MAX_QUESTIONS = 20;
  const MAX_GUESSES = 3;

  useEffect(() => {
    if (scrollRef.current) {
      // Use setTimeout to ensure DOM has updated before scrolling
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTo({
            top: scrollRef.current.scrollHeight,
            behavior: 'smooth'
          });
        }
      }, 50);
    }
  }, [log]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputValue.trim();
    if (!trimmed || isThinking || questionCount >= MAX_QUESTIONS || guessCount >= MAX_GUESSES) return;

    setIsThinking(true);
    setInputValue('');

    if (isGuessMode) {
      try {
        const response = await submitGuess(matchId, trimmed);
        const actual = response.secretPlayer || secretPlayer;
        if (response.isCorrect) {
          onMatchEnd({ isWin: true, actualPlayer: actual });
        } else {
          // Wrong guess!
          const newGuessCount = guessCount + 1;
          setGuessCount(newGuessCount);
          if (response.secretPlayer) setSecretPlayer(response.secretPlayer);

          // Log it as a question that was answered with NO
          const entryId = `q-${Date.now()}`;
          setLog(prev => [...prev, { id: entryId, question: `Is it ${trimmed}?`, answer: 'No' }]);

          if (newGuessCount >= MAX_GUESSES || questionCount + 1 >= MAX_QUESTIONS) {
            setTimeout(() => {
              onMatchEnd({ isWin: false, actualPlayer: actual });
            }, 2000);
          } else {
            setIsThinking(false);
            setIsGuessMode(false); // flip back to ask mode for convenience
          }
        }
      } catch (error) {
        console.error("Failed to submit guess", error);
        setIsThinking(false);
      }
    } else {
      // It's a normal question
      const entryId = `q-${Date.now()}`;
      setLog(prev => [...prev, { id: entryId, question: trimmed, answer: null }]);

      try {
        const response = await askQuestion(matchId, trimmed);
        if (response.secretPlayer) setSecretPlayer(response.secretPlayer);
        setLog(prev => prev.map(entry =>
          entry.id === entryId ? { ...entry, answer: response.ai_badge as AllowedAnswer } : entry
        ));

        // Check if this was the last allowed question
        if (questionCount + 1 >= MAX_QUESTIONS) {
          setTimeout(() => {
            onMatchEnd({ isWin: false, actualPlayer: response.secretPlayer || secretPlayer });
          }, 2000);
        } else {
          setIsThinking(false);
        }
      } catch (error) {
        console.error("Failed to ask question", error);
        setIsThinking(false);
      }
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 font-sans relative">
      {/* Header */}
      <header className="p-4 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center z-10 backdrop-blur-md">
        <h1 className="font-display text-2xl uppercase tracking-widest text-stadium-gold font-bold">
          Match Arena
        </h1>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-sm uppercase hidden md:inline">Questions</span>
            <span className={`font-display text-2xl font-black ${questionCount >= 15 ? 'text-rose-500' : 'text-pitch-grass-secondary'}`}>
              {questionCount} <span className="text-slate-500 text-lg">/ {MAX_QUESTIONS}</span>
            </span>
          </div>
          <div className="w-px h-6 bg-slate-700" />
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-sm uppercase hidden md:inline">Guesses</span>
            <span className={`font-display text-2xl font-black ${guessCount >= 2 ? 'text-rose-500' : 'text-stadium-gold'}`}>
              {guessCount} <span className="text-slate-500 text-lg">/ {MAX_GUESSES}</span>
            </span>
          </div>
        </div>
      </header>

      {/* Scrollable Chat Log */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col gap-6 bg-slate-950"
      >
        {log.length === 0 ? (
          <div className="flex-grow flex items-center justify-center text-slate-500 font-sans italic text-lg">
            Awaiting kickoff... Ask your first question!
          </div>
        ) : (
          log.map((entry) => (
            <motion.div 
              key={entry.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-3"
            >
              {/* User Question */}
              <div className="self-end bg-slate-800/80 border border-slate-700 p-4 rounded-2xl rounded-tr-sm max-w-[80%] shadow-md backdrop-blur-sm">
                <p className="text-slate-100 text-lg">{entry.question}</p>
              </div>

              {/* AI Badge Response */}
              <AnimatePresence>
                {entry.answer ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, x: -20 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    className="self-start"
                  >
                    <div className={`px-6 py-3 rounded-xl border-2 ${getBadgeColorClasses(entry.answer)}`}>
                      <span className="font-display font-black text-2xl uppercase tracking-wider drop-shadow-md">
                        {entry.answer}
                      </span>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="thinking"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="self-start text-slate-500 italic flex items-center gap-2 px-4 py-2"
                  >
                    <Loader2 className="w-4 h-4 animate-spin" />
                    VAR Checking...
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))
        )}
      </div>

      {/* Input Dock — replaced by View Result banner when game is over */}
      <div className="flex-none w-full p-4 bg-slate-900 border-t border-slate-800 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] z-20 relative">
        {isGameOver ? (
          /* ── Game Over banner ── */
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto flex items-center justify-between gap-4 px-2"
          >
            <span className="font-display text-slate-400 text-sm uppercase tracking-widest">
              This match has ended
            </span>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={onViewResult}
              className="flex items-center gap-2 px-6 py-3 bg-stadium-gold text-slate-900 font-display font-bold text-lg uppercase rounded-lg border-b-4 border-yellow-600 active:border-b-0 active:translate-y-1 transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
              View Result
            </motion.button>
          </motion.div>
        ) : (
          /* ── Normal input dock ── */
          <div className="max-w-4xl mx-auto flex flex-col gap-3">
          
          <div className="flex items-center justify-between px-2">
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setIsGuessMode(false)}
                disabled={isThinking}
                className={`font-display uppercase tracking-widest text-xs font-bold transition-all ${!isGuessMode ? 'text-pitch-grass-secondary drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]' : 'text-slate-500 hover:text-slate-300'}`}
              >
                Ask Question
              </button>
              <button
                type="button"
                onClick={() => setIsGuessMode(true)}
                disabled={isThinking || guessCount >= MAX_GUESSES}
                className={`font-display uppercase tracking-widest text-xs font-bold transition-all ${isGuessMode ? 'text-stadium-gold drop-shadow-[0_0_8px_rgba(212,175,55,0.5)]' : 'text-slate-500 hover:text-slate-300'} disabled:opacity-30`}
              >
                Make Guess
              </button>
            </div>
            <button
              type="button"
              onClick={() => onMatchEnd({ isWin: false, actualPlayer: secretPlayer })}
              disabled={isThinking}
              className="text-slate-500 hover:text-rose-400 text-xs uppercase tracking-wider transition-colors"
            >
              Blow Final Whistle (Give Up)
            </button>
          </div>

          <form onSubmit={handleSubmit} className="relative flex items-center">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isThinking || questionCount >= MAX_QUESTIONS || (isGuessMode && guessCount >= MAX_GUESSES)}
              placeholder={isGuessMode ? "Enter player name..." : "e.g. Has he won the Ballon d'Or?"}
              className="w-full bg-slate-950/50 border-2 border-slate-700 rounded-xl px-4 py-4 pr-32 text-lg text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-pitch-grass-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            />
            
            <div className="absolute right-2 flex items-center">
              {isThinking ? (
                <div className="flex items-center gap-2 px-4 py-2 text-stadium-gold">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="font-display font-bold uppercase text-sm tracking-wider">VAR</span>
                </div>
              ) : (
                <button
                  type="submit"
                  disabled={!inputValue.trim() || questionCount >= MAX_QUESTIONS || (isGuessMode && guessCount >= MAX_GUESSES)}
                  className={`p-3 rounded-lg flex items-center justify-center transition-colors ${!inputValue.trim() ? 'bg-slate-800 text-slate-500' : isGuessMode ? 'bg-stadium-gold text-slate-900 hover:bg-yellow-400' : 'bg-pitch-grass-secondary text-slate-900 hover:bg-emerald-400'}`}
                >
                  {isGuessMode ? <AlertCircle className="w-6 h-6" /> : <HelpCircle className="w-6 h-6" />}
                </button>
              )}
            </div>
          </form>

          </div>
        )}
      </div>
    </div>
  );
};
