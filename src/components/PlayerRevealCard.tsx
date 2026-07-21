import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, Trophy, Sparkles, ArrowLeftCircle, Home } from 'lucide-react';
import { getPlayerPortraitSrc } from '../services/playerArt';

interface PlayerRevealCardProps {
  playerName: string;
  isWin: boolean;
  onReset: () => void;
  onGoHome: () => void;
  onBackToChat?: () => void;
}

export const PlayerRevealCard: React.FC<PlayerRevealCardProps> = ({ playerName, isWin, onReset, onGoHome, onBackToChat }) => {
  const [typedName, setTypedName] = useState('');

  useEffect(() => {
    let current = '';
    const interval = setInterval(() => {
      if (current.length < playerName.length) {
        current += playerName[current.length];
        setTypedName(current);
      } else {
        clearInterval(interval);
      }
    }, 100); // typing speed
    
    return () => clearInterval(interval);
  }, [playerName]);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center w-full px-4 py-6"
    >
      <div className="w-full max-w-4xl rounded-[2rem] border border-slate-800/90 bg-slate-950/90 shadow-[0_0_80px_rgba(2,6,23,0.7)] backdrop-blur-xl overflow-hidden">
        <div className="h-2 w-full bg-gradient-to-r from-emerald-400 via-teal-400 to-stadium-gold" />
        <div className="grid gap-0 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="relative p-6 sm:p-8 bg-[radial-gradient(circle_at_top,rgba(31,162,74,0.12),transparent_40%),linear-gradient(180deg,rgba(8,15,28,0.95),rgba(2,6,23,0.98))] border-b lg:border-b-0 lg:border-r border-slate-800/80">
            <div className="flex items-center justify-between">
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.28em] border ${isWin ? 'border-emerald-400/30 bg-emerald-950/50 text-emerald-300' : 'border-rose-400/30 bg-rose-950/50 text-rose-300'}`}>
                {isWin ? <Trophy className="w-3.5 h-3.5" /> : <ArrowLeftCircle className="w-3.5 h-3.5" />}
                {isWin ? 'Correct Guess' : 'Match Ended'}
              </div>
              <div className="w-12 sm:w-14 h-12 sm:h-14 border border-stadium-gold/50 bg-slate-950/80 rounded-2xl flex items-center justify-center overflow-hidden shadow-xl p-1" title="MIC Club Official Edition">
                <img src="/mic_logo.png" alt="MIC Club Logo" className="w-full h-full object-contain rounded-xl" />
              </div>
            </div>

            <div className="mt-8 relative mx-auto w-full max-w-[280px] sm:max-w-[320px] aspect-[2.45/3.35] rounded-[1.6rem] border border-stadium-gold/40 bg-gradient-to-br from-stadium-gold via-yellow-600 to-amber-700 p-2 shadow-[0_0_50px_rgba(212,175,55,0.35)]">
              <div className="absolute inset-[10px] rounded-[1.25rem] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.14),transparent_35%),linear-gradient(180deg,rgba(15,23,42,0.86),rgba(2,6,23,0.95))] overflow-hidden border border-yellow-300/30">
                <div className="absolute inset-0 opacity-10 bg-[linear-gradient(135deg,rgba(255,255,255,0.6)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.6)_50%,rgba(255,255,255,0.6)_75%,transparent_75%,transparent)] bg-[length:12px_12px]" />
                <div className="relative h-full flex flex-col justify-between p-4 sm:p-5 text-floodlight">
                  <div className="flex items-start justify-between">
                    <div className="flex flex-col">
                      <span className="font-display font-black text-4xl text-stadium-gold">99</span>
                      <span className="font-sans text-[10px] uppercase tracking-[0.3em] text-slate-300">Overall</span>
                    </div>
                    <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] uppercase tracking-[0.22em] text-slate-200">
                      <Sparkles className="w-3.5 h-3.5 text-stadium-gold" />
                      Live Reveal
                    </div>
                  </div>

                  <div className="flex-1 flex items-center justify-center py-4">
                    <div className="w-full max-w-[260px] rounded-[1.4rem] overflow-hidden shadow-2xl border border-white/10">
                      <img
                        src={getPlayerPortraitSrc(playerName)}
                        alt={playerName}
                        className="block w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  <div className="border-t border-stadium-gold/20 pt-3 text-center">
                    <h2 className="font-display font-black text-xl sm:text-3xl tracking-[0.18em] uppercase min-h-9 text-white drop-shadow-md">
                      {typedName}
                    </h2>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8 flex flex-col justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-700 bg-slate-900/80 text-[11px] font-bold uppercase tracking-[0.28em] text-slate-300">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                Match Summary
              </div>
              <h3 className="mt-4 font-display text-3xl sm:text-5xl font-black uppercase text-white drop-shadow-md">
                {isWin ? 'You nailed it!' : 'Game Over'}
              </h3>
              <p className="mt-3 max-w-lg text-sm sm:text-base text-slate-400 leading-relaxed">
                {isWin
                  ? 'You read the clues correctly and pinned down the secret football star.'
                  : 'The whistle has blown. Review the chat, adjust your strategy, and come back sharper.'}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'PAC', value: '99' },
                { label: 'SHO', value: '99' },
                { label: 'PAS', value: '99' },
              ].map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-center">
                  <div className="text-[10px] uppercase tracking-[0.28em] text-slate-500">{stat.label}</div>
                  <div className="mt-1 font-display text-2xl font-black text-stadium-gold">{stat.value}</div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-start gap-3">
          {/* Back to Chat */}
          {onBackToChat && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onBackToChat}
              className="flex items-center gap-3 px-5 py-3 sm:px-6 sm:py-3.5 bg-slate-800 text-slate-200 font-display text-lg sm:text-xl uppercase font-bold rounded-xl shadow-md border border-slate-700 active:translate-y-1 transition-all hover:bg-slate-700"
            >
              <ArrowLeftCircle className="w-5 h-5" />
              Chat Log
            </motion.button>
          )}

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onGoHome}
            className="flex items-center gap-3 px-5 py-3 sm:px-6 sm:py-3.5 bg-slate-900 text-slate-200 font-display text-lg sm:text-xl uppercase font-bold rounded-xl shadow-md border border-slate-700 active:translate-y-1 transition-all hover:bg-slate-800"
          >
            <Home className="w-5 h-5" />
            Home
          </motion.button>

          {/* Play Again */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onReset}
            className="flex items-center gap-3 px-5 py-3 sm:px-6 sm:py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-display text-lg sm:text-xl uppercase font-black rounded-xl shadow-[0_0_30px_rgba(31,162,74,0.3)] border border-emerald-300/40 active:translate-y-1 transition-all hover:from-emerald-400 hover:to-teal-400"
          >
            <RotateCcw className="w-6 h-6" />
            Retry
          </motion.button>
        </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
