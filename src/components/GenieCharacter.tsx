import { motion, AnimatePresence } from 'framer-motion';
import { MicLogo } from './MicLogo';

type GenieState = 'idle' | 'thinking' | 'confident';

interface GenieCharacterProps {
  state: GenieState;
}

export const GenieCharacter = ({ state }: GenieCharacterProps) => {
  const bgPositions = {
    idle: '0% 50%',
    thinking: '50% 50%',
    confident: '100% 50%'
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center p-4">
      {/* Background magical glow */}
      <motion.div
        animate={{
          scale: state === 'thinking' ? [1, 1.2, 1] : 1,
          opacity: state === 'thinking' ? [0.4, 0.8, 0.4] : 0.2,
        }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute w-3/4 aspect-square bg-pitch-grass-secondary/40 rounded-full blur-[80px]"
      />
      
      <AnimatePresence mode="wait">
        <motion.div
          key="genie-container"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative z-10 w-full max-w-[350px] mt-auto lg:mt-0 aspect-square"
        >
          {/* Subtle floating/breathing animation over the spritesheet */}
          <motion.div
            className="w-full h-full drop-shadow-2xl rounded-[3rem] border-4 border-slate-700/50 relative overflow-hidden flex items-center justify-center"
            style={{ backgroundColor: 'rgb(2, 34, 81)' }}
            animate={
              state === 'thinking'
                ? { y: [0, -10, 0], scale: [1, 1.02, 1] }
                : state === 'confident'
                ? { y: [0, -5, 0], scale: [1, 1.02, 1] }
                : { y: [0, -15, 0] }
            }
            transition={{
              duration: state === 'thinking' ? 1.5 : state === 'confident' ? 2 : 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <div 
              className="h-full aspect-[16/27] relative"
              style={{
                backgroundImage: "url('/mic_lamp_genie_black_jersey.jpg')",
                backgroundSize: '300% 100%',
                backgroundPosition: bgPositions[state],
                transition: 'background-position 0.1s steps(1)',
                maskImage: 'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)',
                WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)'
              }}
            />
          </motion.div>
        </motion.div>
      </AnimatePresence>

      <div className="mt-8 font-display text-2xl uppercase tracking-widest text-stadium-gold font-bold text-center h-10 flex items-center justify-center relative z-20">
        <AnimatePresence mode="wait">
          {state === 'thinking' && (
            <motion.div
              key="thinking-text"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-3"
            >
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-stadium-gold animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-stadium-gold animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-stadium-gold animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="drop-shadow-md">VAR Checking...</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
