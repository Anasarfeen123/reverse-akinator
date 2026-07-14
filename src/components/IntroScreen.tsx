import React from 'react';

interface IntroScreenProps {
  onStart: () => void;
  isLoading: boolean;
}

export const IntroScreen: React.FC<IntroScreenProps> = ({ onStart, isLoading }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 space-y-8 animate-in fade-in zoom-in duration-500">
      <div className="space-y-4">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 drop-shadow-sm uppercase">
          Reverse Akinator
        </h1>
        <p className="text-xl md:text-2xl font-light text-slate-300 max-w-lg mx-auto">
          Think of a football player. I will ask you up to 20 questions to guess who it is.
        </p>
      </div>

      <button
        onClick={onStart}
        disabled={isLoading}
        className="group relative inline-flex items-center justify-center px-10 py-4 text-xl font-bold text-slate-950 bg-cyan-500 rounded-full overflow-hidden transition-all hover:bg-cyan-400 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 uppercase tracking-widest shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)]"
      >
        <span className="relative z-10 flex items-center space-x-2">
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-slate-950" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Connecting...</span>
            </>
          ) : (
            <span>Start Game</span>
          )}
        </span>
        <div className="absolute inset-0 h-full w-full bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out"></div>
      </button>
    </div>
  );
};
