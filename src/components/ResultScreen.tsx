import React from 'react';
import type { GameState } from '../types/game';

interface ResultScreenProps {
  state: GameState;
  onRestart: () => void;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({ state, onRestart }) => {
  const isWin = state.status === 'WIN';

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 space-y-8 animate-in zoom-in duration-500">
      <div className={`p-8 rounded-3xl border-2 backdrop-blur-lg shadow-2xl ${isWin ? 'bg-emerald-900/40 border-emerald-500/50 shadow-emerald-500/20' : 'bg-rose-900/40 border-rose-500/50 shadow-rose-500/20'} max-w-lg w-full relative overflow-hidden`}>
        {/* Glow effect */}
        <div className={`absolute -top-20 -left-20 w-40 h-40 rounded-full blur-3xl opacity-30 ${isWin ? 'bg-emerald-500' : 'bg-rose-500'}`} />
        
        <div className="relative z-10 space-y-6">
          <h2 className="text-4xl md:text-5xl font-extrabold uppercase tracking-tight text-white drop-shadow-md">
            {isWin ? 'I Guessed It!' : 'You Beat Me!'}
          </h2>
          
          {isWin ? (
            <div className="space-y-2">
              <p className="text-xl text-slate-300 font-medium">You were thinking of:</p>
              <p className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                {state.guessedPlayer}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xl text-slate-300 font-medium">I couldn't guess your player.</p>
              <p className="text-2xl font-bold text-rose-300">
                Well played!
              </p>
            </div>
          )}
        </div>
      </div>

      <button
        onClick={onRestart}
        className="px-8 py-3 text-lg font-bold text-white bg-slate-800 rounded-full hover:bg-slate-700 active:scale-95 transition-all uppercase tracking-wider border border-slate-700 hover:border-slate-500 shadow-lg"
      >
        Play Again
      </button>
    </div>
  );
};
