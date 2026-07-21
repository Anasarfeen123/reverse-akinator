import { useState, useRef, useEffect, useCallback } from 'react';
import { HelpCircle, AlertCircle, Loader2, Settings, Cpu, Sparkles, MessageSquare, Zap, Flag } from 'lucide-react';
import { askQuestion, submitGuess, giveUpMatch } from '../services/api';
import type { AllowedAnswer } from '../types/game';
import { type ModelConfig, PROVIDER_MODELS } from '../services/modelConfig';

interface MatchArenaProps {
  matchId: string;
  onMatchEnd: (result: { isWin: boolean; actualPlayer?: string }) => void;
  onGoHome: () => void;
  isGameOver?: boolean;
  onViewResult?: () => void;
  modelConfig?: ModelConfig;
  onOpenSettings?: () => void;
}

interface LogEntry {
  id: string;
  question: string;
  answer: AllowedAnswer | null;
  confidence?: number;
  isGuessAttempt?: boolean;
  error?: string;
}

const getBadgeColorClasses = (answer?: AllowedAnswer | null) => {
  switch (answer) {
    case 'Yes': return 'border-emerald-500 text-emerald-300 bg-emerald-950/90 shadow-[0_0_12px_rgba(16,185,129,0.35)]';
    case 'No': return 'border-rose-500 text-rose-300 bg-rose-950/90 shadow-[0_0_12px_rgba(244,63,94,0.35)]';
    case 'Probably': return 'border-teal-400 text-teal-200 bg-teal-950/90 shadow-[0_0_12px_rgba(20,184,166,0.35)]';
    case 'Probably Not': return 'border-amber-400 text-amber-200 bg-amber-950/90 shadow-[0_0_12px_rgba(245,158,11,0.35)]';
    case "Don't Know": return 'border-slate-500 text-slate-300 bg-slate-900/90 shadow-[0_0_12px_rgba(100,116,139,0.35)]';
    default: return 'border-slate-700 text-slate-300 bg-slate-800/80';
  }
};

const SUGGESTED_QUESTIONS = [
  "Is he active?",
  "Is he European?",
  "Is he South American?",
  "Is he a forward?",
  "Is he a midfielder?",
  "Is he right-footed?",
  "Has he won a Ballon d'Or?",
  "Has he won the World Cup?",
  "Has he won the Champions League?",
];

export const MatchArena = ({
  matchId,
  onMatchEnd,
  onGoHome,
  isGameOver = false,
  onViewResult,
  modelConfig,
  onOpenSettings,
}: MatchArenaProps) => {
  const [log, setLog] = useState<LogEntry[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [isGuessMode, setIsGuessMode] = useState(false);
  const [guessCount, setGuessCount] = useState(0);
  const [secretPlayer, setSecretPlayer] = useState<string | undefined>(undefined);

  const scrollRef = useRef<HTMLDivElement>(null);

  const questionCount = log.filter(e => !e.isGuessAttempt).length;
  const MAX_QUESTIONS = 20;
  const MAX_GUESSES = 3;

  // Optimized smooth scroll using requestAnimationFrame to eliminate lag
  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      requestAnimationFrame(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTo({
            top: scrollRef.current.scrollHeight,
            behavior: 'smooth'
          });
        }
      });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [log, isThinking, scrollToBottom]);

  const processSubmission = async (text: string, asGuess: boolean) => {
    const trimmed = text.trim();
    if (!trimmed || isThinking || questionCount >= MAX_QUESTIONS || guessCount >= MAX_GUESSES) return;

    setIsThinking(true);
    setInputValue('');

    if (asGuess) {
      try {
        const response = await submitGuess(matchId, trimmed, modelConfig);
        const actual = response.secretPlayer || secretPlayer;
        if (response.isCorrect) {
          if (response.secretPlayer) setSecretPlayer(response.secretPlayer);
          onMatchEnd({ isWin: true, actualPlayer: actual });
        } else {
          // Wrong guess!
          const newGuessCount = guessCount + 1;
          setGuessCount(newGuessCount);

          // Log guess attempt with distinctive styling
          const entryId = `guess-${Date.now()}`;
          setLog(prev => [...prev, { id: entryId, question: `Guess: Is it "${trimmed}"?`, answer: 'No', isGuessAttempt: true }]);

          if (newGuessCount >= MAX_GUESSES || questionCount >= MAX_QUESTIONS) {
            setTimeout(() => {
              void (async () => {
                try {
                  const reveal = await giveUpMatch(matchId, modelConfig);
                  if (reveal.secretPlayer) setSecretPlayer(reveal.secretPlayer);
                  onMatchEnd({ isWin: false, actualPlayer: reveal.secretPlayer || secretPlayer });
                } catch (error) {
                  console.error('Failed to reveal answer after max guesses', error);
                  onMatchEnd({ isWin: false, actualPlayer: secretPlayer });
                }
              })();
            }, 1500);
          } else {
            setIsThinking(false);
            setIsGuessMode(false); // flip back to ask mode
          }
        }
      } catch (error) {
        console.error("Failed to submit guess", error);
        setIsThinking(false);
      }
    } else {
      // Normal Question
      const entryId = `q-${Date.now()}`;
      setLog(prev => [...prev, { id: entryId, question: trimmed, answer: null }]);

      try {
        const response = await askQuestion(matchId, trimmed, modelConfig);

        setLog(prev => prev.map(entry =>
          entry.id === entryId ? { ...entry, answer: response.ai_badge as AllowedAnswer, confidence: response.confidence } : entry
        ));

        if (questionCount + 1 >= MAX_QUESTIONS) {
          setTimeout(() => {
            void (async () => {
              try {
                const reveal = await giveUpMatch(matchId, modelConfig);
                if (reveal.secretPlayer) setSecretPlayer(reveal.secretPlayer);
                onMatchEnd({ isWin: false, actualPlayer: reveal.secretPlayer || secretPlayer });
              } catch (error) {
                console.error('Failed to reveal answer after max questions', error);
                onMatchEnd({ isWin: false, actualPlayer: secretPlayer });
              }
            })();
          }, 1500);
        } else {
          setIsThinking(false);
        }
      } catch (error: any) {
        console.error("Failed to ask question", error);
        setLog(prev => prev.map(entry =>
          entry.id === entryId ? { ...entry, error: error.message || 'Failed to get answer from server' } : entry
        ));
        setIsThinking(false);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    processSubmission(inputValue, isGuessMode);
  };

  const handleChipClick = (questionText: string) => {
    if (isThinking || isGameOver) return;
    setIsGuessMode(false);
    processSubmission(questionText, false);
  };

  const currentProviderLabel = modelConfig ? PROVIDER_MODELS[modelConfig.provider]?.label || modelConfig.provider : 'Ollama';
  const currentModelName = modelConfig?.model || 'qwen2.5-coder:7b';
  const handleGiveUp = () => {
    if (isGameOver) return;
    void (async () => {
      try {
        const response = await giveUpMatch(matchId, modelConfig);
        if (response.secretPlayer) setSecretPlayer(response.secretPlayer);
        onMatchEnd({ isWin: false, actualPlayer: response.secretPlayer || secretPlayer });
      } catch (error) {
        console.error('Failed to give up match', error);
        onMatchEnd({ isWin: false, actualPlayer: secretPlayer });
      }
    })();
  };

  // Dynamic status phrase for Akinator
  const getAkinatorSpeech = () => {
    if (isThinking) return "Evaluating with absolute factual precision...";
    if (isGuessMode) return "Who do you think my secret player is? Type their full name!";
    if (questionCount === 0) return "I have chosen a secret football star! Ask me your first question.";
    if (questionCount >= 15) return "You're running low on questions! Consider making a guess soon.";
    const lastEntry = log[log.length - 1];
    if (lastEntry?.isGuessAttempt) return "Incorrect guess! Keep analyzing the clues.";
    const lastAnswer = lastEntry?.answer;
    if (lastAnswer === 'Yes') return "Yes! Excellent observation.";
    if (lastAnswer === 'No') return "No! That doesn't match the secret player.";
    if (lastAnswer === 'Probably') return "Probably... that aligns closely with the profile!";
    if (lastAnswer === 'Probably Not') return "Probably not... unlikely for this player.";
    return "What would you like to ask next?";
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 font-sans relative">
      {/* Header */}
      <header className="p-3.5 border-b border-slate-800 bg-slate-900/80 flex justify-between items-center z-10 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <img src="/reverse_akinator_logo.png" alt="Reverse Akinator Logo" className="h-9 sm:h-10 w-auto object-contain rounded" />
            <h1 className="font-display text-lg sm:text-xl uppercase tracking-widest text-stadium-gold font-bold hidden xs:inline">
              Match Arena
            </h1>
            <div className="w-px h-5 bg-slate-700 mx-1 hidden sm:block" />
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-xl bg-slate-900 border border-stadium-gold/50 shadow-md">
              <img src="/mic-logo.jpg" alt="MIC Club Logo" className="w-9 sm:w-10 h-9 sm:h-10 object-contain rounded-xl border border-stadium-gold/40 p-1 bg-white/90" />
              <span className="text-xs font-black text-stadium-gold uppercase tracking-widest">MIC Club</span>
            </div>
          </div>

          {/* Active Model Pill */}
          <button
            type="button"
            onClick={onOpenSettings}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700 hover:border-emerald-500/50 text-[11px] font-mono text-slate-300 transition"
            title="Click to change AI model & API keys"
          >
            <Cpu className="w-3 h-3 text-emerald-400" />
            <span className="text-emerald-400 font-bold">{currentProviderLabel}:</span>
            <span className="truncate max-w-[120px]">{currentModelName}</span>
          </button>

          {/* 100% Offline RAG Badge */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/90 border border-emerald-500/40 text-[10px] font-mono text-emerald-300 font-bold shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>100% Offline Wikipedia RAG (35 Stars Stored)</span>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-5">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 text-xs uppercase hidden sm:inline">Questions</span>
            <span className={`font-display text-lg sm:text-xl font-black ${questionCount >= 15 ? 'text-rose-500' : 'text-emerald-400'}`}>
              {questionCount} <span className="text-slate-500 text-sm">/ {MAX_QUESTIONS}</span>
            </span>
          </div>

          <div className="w-px h-5 bg-slate-700" />

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 text-xs uppercase hidden sm:inline">Guesses</span>
            <span className={`font-display text-lg sm:text-xl font-black ${guessCount >= 2 ? 'text-rose-500' : 'text-stadium-gold'}`}>
              {guessCount} <span className="text-slate-500 text-sm">/ {MAX_GUESSES}</span>
            </span>
          </div>

          {onOpenSettings && (
            <>
              <div className="w-px h-5 bg-slate-700" />
              <button
                type="button"
                onClick={onOpenSettings}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                title="AI Model & API Key Settings"
                >
                  <Settings className="w-4 h-4 text-emerald-400" />
                </button>
            </>
          )}

          {!isGameOver && (
            <>
              <div className="w-px h-5 bg-slate-700" />
              <button
                type="button"
                onClick={handleGiveUp}
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-950/80 border border-rose-500/40 text-[11px] font-bold uppercase tracking-wider text-rose-200 hover:bg-rose-900 transition"
                title="Give up and reveal the player"
              >
                <Flag className="w-3.5 h-3.5" />
                Give Up
              </button>
            </>
          )}
        </div>
      </header>

      {/* Game Over Banner Overlay if navigating back to chat */}
      {isGameOver && onViewResult && (
        <div className="bg-stadium-gold/10 border-b border-stadium-gold/30 px-4 py-2 flex items-center justify-between z-10 backdrop-blur-sm shrink-0">
          <span className="text-xs uppercase tracking-wider text-stadium-gold font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> Full Time — Match Ended
          </span>
          <button
            onClick={onGoHome}
            className="text-xs bg-stadium-gold text-slate-950 px-3 py-1 rounded font-bold uppercase tracking-wider hover:bg-yellow-400 transition"
          >
            Home
          </button>
        </div>
      )}

      {/* Main Grid: Left Akinator Card & Right Chat */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* Akinator Character Sidebar / Banner */}
        <aside className="w-full md:w-72 lg:w-80 p-4 border-b md:border-b-0 md:border-r border-slate-800/80 bg-slate-900/40 flex md:flex-col items-center justify-start gap-4 shrink-0 backdrop-blur-sm z-10">
          <div className="relative group shrink-0">
            {/* Ambient ring glow */}
            <div
              className={`absolute -inset-1 rounded-2xl transition-all duration-300 ${
                isThinking
                  ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 opacity-80 animate-pulse'
                  : isGuessMode
                  ? 'bg-amber-400/60 opacity-80'
                  : 'bg-emerald-500/40 opacity-40'
              }`}
            />
            {/* Akinator Image */}
            <div className="relative w-20 h-20 md:w-44 md:h-44 rounded-2xl overflow-hidden border-2 border-slate-700/80 bg-slate-950 shadow-2xl">
              <img
                src="/akinator.jpg"
                alt="Referee Akinator"
                className={`w-full h-full object-cover transition-transform duration-300 ${
                  isThinking ? 'scale-105 filter brightness-110' : 'group-hover:scale-105'
                }`}
              />
              {/* Floating Badge on Image */}
              <div className="absolute bottom-1.5 left-1.5 right-1.5 px-2 py-0.5 rounded-lg bg-slate-950/90 backdrop-blur-md border border-slate-800 text-[10px] uppercase font-bold text-stadium-gold text-center tracking-wider truncate">
                {isThinking ? '⚡ Fact Checking...' : isGuessMode ? '🎯 Guess Mode' : '⚽ AI Referee'}
              </div>
            </div>
          </div>

          {/* Akinator Speech Bubble */}
          <div className="flex-1 w-full bg-slate-950/90 border border-slate-800 rounded-2xl p-3 md:p-4 relative flex flex-col justify-center shadow-lg">
            {/* Speech Pointer Arrow for Desktop */}
            <div className="hidden md:block absolute -left-2 top-8 w-4 h-4 bg-slate-950 border-l border-b border-slate-800 transform rotate-45" />

            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1">
              <Sparkles className="w-3.5 h-3.5" /> Referee Akinator
            </div>
            <p className="text-xs md:text-sm text-slate-200 font-medium italic leading-relaxed">
              "{getAkinatorSpeech()}"
            </p>
          </div>
        </aside>

        {/* Conversation Log Area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 will-change-transform">
          {log.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-3 py-12">
              <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-emerald-400 shadow-lg">
                <HelpCircle className="w-7 h-7" />
              </div>
              <h3 className="font-display text-lg uppercase tracking-wider text-slate-300 font-bold">
                Start Your Interrogation
              </h3>
              <p className="text-center text-xs md:text-sm text-slate-400 max-w-md leading-relaxed px-4">
                Ask any Yes/No question to narrow down the secret player from 35+ legendary football stars. Use the quick question chips below or type your own!
              </p>
            </div>
          ) : (
            log.map((entry, index) => (
              <div
                key={entry.id}
                className="flex flex-col gap-2 max-w-2xl mx-auto"
              >
                {/* User Question / Guess */}
                <div className={`self-end flex items-start gap-2.5 max-w-[85%]`}>
                  <div
                    className={`rounded-2xl rounded-tr-sm px-4 py-3 text-slate-100 shadow-md font-medium text-sm leading-relaxed border ${
                      entry.isGuessAttempt
                        ? 'bg-amber-950/70 border-amber-500/50 text-amber-100'
                        : 'bg-slate-800/90 border-slate-700/60'
                    }`}
                  >
                    <div className="flex items-center gap-2 text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">
                      <span>{entry.isGuessAttempt ? '🎯 Guess' : `Q${index + 1}`}</span>
                    </div>
                    {entry.question}
                  </div>
                </div>

                {/* AI Badge Response */}
                <div className="self-start flex items-center gap-3 mt-0.5 ml-1">
                  {entry.error ? (
                    <div className="flex items-center gap-2 text-rose-400 text-xs px-3 py-1.5 rounded-full bg-rose-950/40 border border-rose-500/30">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 animate-bounce" />
                      <span>{entry.error}</span>
                    </div>
                  ) : entry.answer === null ? (
                    <div className="flex items-center gap-2 text-slate-400 text-xs italic px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 animate-pulse">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                      Consulting fact base...
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1.5 self-start">
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full border transition-all shadow-md ${getBadgeColorClasses(
                            entry.answer
                          )}`}
                        >
                          {entry.answer}
                        </span>
                        {entry.confidence !== undefined && (
                          <span className="text-[11px] font-mono font-bold text-slate-400 bg-slate-900/90 border border-slate-800 px-2 py-0.5 rounded-md">
                            {entry.confidence}% Confidence
                          </span>
                        )}
                      </div>

                      {/* Neon AI Confidence Meter */}
                      {entry.confidence !== undefined && (
                        <div className="w-44 bg-slate-900/90 rounded-full h-1.5 overflow-hidden border border-slate-800 p-0.5 mt-0.5">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${
                              entry.confidence >= 85
                                ? 'bg-gradient-to-r from-emerald-500 to-green-400 shadow-[0_0_8px_rgba(34,197,94,0.6)]'
                                : entry.confidence >= 65
                                ? 'bg-gradient-to-r from-amber-500 to-yellow-400 shadow-[0_0_8px_rgba(245,158,11,0.6)]'
                                : 'bg-gradient-to-r from-rose-500 to-red-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]'
                            }`}
                            style={{ width: `${Math.max(entry.confidence, 4)}%` }}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}

          {/* Floating Thinking Indicator */}
          {isThinking && log.length > 0 && log[log.length - 1].answer !== null && (
            <div className="flex justify-start max-w-2xl mx-auto">
              <div className="flex items-center gap-2 text-slate-400 text-xs italic px-4 py-2 rounded-full bg-slate-900/90 border border-slate-800">
                <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                Evaluating player records...
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Suggested Quick Question Chips Bar */}
      {!isGameOver && (
        <div className="px-4 py-2 bg-slate-950/90 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto scrollbar-none z-10 shrink-0">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1 shrink-0">
            <Zap className="w-3 h-3 text-amber-400" /> Quick Ask:
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto whitespace-nowrap scrollbar-none py-0.5">
            {SUGGESTED_QUESTIONS.map((qText) => (
              <button
                key={qText}
                type="button"
                disabled={isThinking || questionCount >= MAX_QUESTIONS}
                onClick={() => handleChipClick(qText)}
                className="px-2.5 py-1 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-700/80 hover:border-emerald-500/60 text-[11px] font-medium text-slate-300 hover:text-emerald-300 transition shrink-0 disabled:opacity-40"
              >
                {qText}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Control Bar */}
      <div className="p-3.5 border-t border-slate-800 bg-slate-900/90 backdrop-blur-md z-10 shrink-0">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto flex flex-col sm:flex-row gap-2.5">
          {/* Mode Toggle Button */}
          <button
            type="button"
            disabled={isGameOver || isThinking || guessCount >= MAX_GUESSES}
            onClick={() => setIsGuessMode(!isGuessMode)}
            className={`px-3.5 py-2.5 rounded-xl font-bold uppercase tracking-wider text-xs transition border flex items-center justify-center gap-1.5 shrink-0 ${
              isGuessMode
                ? 'bg-stadium-gold text-slate-950 border-stadium-gold shadow-[0_0_15px_rgba(234,179,8,0.4)]'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-500'
            } disabled:opacity-50`}
          >
            {isGuessMode ? '🎯 Guess Mode' : '❓ Ask Question'}
          </button>

          {/* Text Input */}
          <div className="relative flex-1">
            <input
              type="text"
              disabled={isGameOver || isThinking || (isGuessMode ? guessCount >= MAX_GUESSES : questionCount >= MAX_QUESTIONS)}
              placeholder={
                isGameOver
                  ? 'Match ended'
                  : isGuessMode
                  ? 'Type full name of player (e.g. Erling Haaland, Messi, CR7)...'
                  : 'Ask a Yes/No question (e.g. Is he active? Is he right-footed?)...'
              }
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className={`w-full bg-slate-950 border rounded-xl px-4 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none transition ${
                isGuessMode ? 'border-stadium-gold/60 focus:border-stadium-gold' : 'border-slate-700 focus:border-emerald-500'
              } disabled:opacity-50 text-sm`}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isGameOver || isThinking || !inputValue.trim() || (isGuessMode ? guessCount >= MAX_GUESSES : questionCount >= MAX_QUESTIONS)}
            className={`px-5 py-2.5 rounded-xl font-bold uppercase tracking-wider text-xs transition border shrink-0 flex items-center justify-center gap-1.5 ${
              isGuessMode
                ? 'bg-stadium-gold text-slate-950 border-stadium-gold hover:bg-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.3)]'
                : 'bg-emerald-500 text-slate-950 border-emerald-400 hover:bg-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isThinking ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Thinking...
              </>
            ) : isGuessMode ? (
              'Submit Guess'
            ) : (
              <>
                <MessageSquare className="w-3.5 h-3.5" /> Ask
              </>
            )}
          </button>

          {!isGameOver && (
            <button
              type="button"
              onClick={handleGiveUp}
              className="sm:hidden px-4 py-2.5 rounded-xl border border-rose-500/40 bg-rose-950/70 text-rose-200 text-xs font-bold uppercase tracking-wider transition hover:bg-rose-900 flex items-center justify-center gap-1.5"
            >
              <Flag className="w-3.5 h-3.5" />
              Give Up
            </button>
          )}
        </form>
      </div>
    </div>
  );
};
