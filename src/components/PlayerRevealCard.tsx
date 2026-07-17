import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw } from 'lucide-react';

interface PlayerRevealCardProps {
  playerName: string;
  isWin: boolean;
  onReset: () => void;
  onBackToChat?: () => void;
}

export const PlayerRevealCard: React.FC<PlayerRevealCardProps> = ({ playerName, isWin, onReset, onBackToChat }) => {
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
      className="flex flex-col items-center justify-center w-full px-4"
    >
      <div className="relative w-full max-w-[280px] sm:max-w-[320px] aspect-[2.5/3.5] bg-gradient-to-br from-gold to-yellow-600 rounded-lg p-2 shadow-[0_0_50px_rgba(212,175,55,0.4)] border-4 border-yellow-300">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMSI+PC9yZWN0Pgo8cGF0aCBkPSJNMCAwTDggOFpNOCAwTDAgOFoiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIj48L3BhdGg+Cjwvc3ZnPg==')] opacity-20 rounded-lg" />
        
        <div className="relative h-full flex flex-col justify-between items-center bg-navy/80 rounded-md p-4 overflow-hidden border-2 border-gold/50 text-floodlight">
          
          <div className="w-full flex justify-between items-start">
            <div className="flex flex-col items-center">
              <span className="font-display font-black text-4xl text-gold">99</span>
              <span className="font-sans text-xs uppercase tracking-widest text-slate-300">OVR</span>
            </div>
            {/* Generic placeholder badge */}
            <div className="w-10 h-10 border-2 border-slate-400 bg-slate-800 rounded-full flex items-center justify-center">
              <span className="font-display font-bold text-slate-400">XI</span>
            </div>
          </div>

          <div className="w-32 h-32 sm:w-40 sm:h-40 flex-grow flex items-center justify-center -mt-2">
            <div className="w-24 h-24 sm:w-32 sm:h-32 bg-slate-700/50 rounded-full flex items-end justify-center overflow-hidden shadow-inner relative border-4 border-slate-600/50">
              <svg className="w-20 h-20 sm:w-24 sm:h-24 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>
          </div>
          
          <div className="w-full text-center mt-2 sm:mt-4 border-t-2 border-gold/30 pt-2 sm:pt-4">
            <h2 className="font-display font-bold text-xl sm:text-3xl tracking-wide uppercase h-8 sm:h-10">
              {typedName}
            </h2>
          </div>
          
          <div className="w-full flex justify-around mt-4 pt-2 border-t border-gold/10 font-display text-sm">
            <div className="flex flex-col items-center"><span>PAC</span><span className="font-bold text-gold">99</span></div>
            <div className="flex flex-col items-center"><span>SHO</span><span className="font-bold text-gold">99</span></div>
            <div className="flex flex-col items-center"><span>PAS</span><span className="font-bold text-gold">99</span></div>
          </div>
        </div>
      </div>

      <div className="mt-6 sm:mt-8 text-center">
        <h3 className="font-display text-2xl sm:text-4xl font-bold uppercase text-white mb-4 sm:mb-6 drop-shadow-md">
          {isWin ? 'You nailed it!' : 'Game Over'}
        </h3>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {/* Back to Chat */}
          {onBackToChat && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onBackToChat}
              className="flex items-center gap-3 px-6 py-3 sm:px-8 sm:py-4 bg-slate-700 text-slate-200 font-display text-xl sm:text-2xl uppercase font-bold rounded-lg shadow-md border-b-4 border-slate-800 active:border-b-0 active:translate-y-1 transition-all hover:bg-slate-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Chat Log
            </motion.button>
          )}

          {/* Play Again */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onReset}
            className="flex items-center gap-3 px-6 py-3 sm:px-8 sm:py-4 bg-pitch-bright text-floodlight font-display text-xl sm:text-2xl uppercase font-bold rounded-lg shadow-[0_0_30px_rgba(31,162,74,0.3)] border-b-4 border-pitch-deep active:border-b-0 active:translate-y-1 transition-all"
          >
            <RotateCcw className="w-6 h-6" />
            Retry
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};
