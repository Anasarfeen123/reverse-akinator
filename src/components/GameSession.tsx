import React from 'react';
import { useGameMachine } from '../hooks/useGameMachine';
import { IntroScreen } from './IntroScreen';
import { GameScreen } from './GameScreen';
import { ResultScreen } from './ResultScreen';

export const GameSession: React.FC = () => {
  const { state, startGame, submitAnswer, restartGame } = useGameMachine();

  const renderContent = () => {
    switch (state.status) {
      case 'INTRO':
        return <IntroScreen onStart={startGame} isLoading={false} />;
      case 'LOADING':
        // If it's the very first load before question 1, show intro loading
        if (state.questionCount === 0) {
          return <IntroScreen onStart={startGame} isLoading={true} />;
        }
        // Otherwise, show GameScreen which handles its own loading state via disabled inputs
        return <GameScreen state={state} onAnswer={submitAnswer} />;
      case 'ASKING':
        return <GameScreen state={state} onAnswer={submitAnswer} />;
      case 'WIN':
      case 'LOSE':
        return <ResultScreen state={state} onRestart={restartGame} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100 selection:bg-cyan-500/30 flex flex-col relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-cyan-900/20 rounded-full blur-[120px] pointer-events-none" />
      
      {/* Main content container */}
      <main className="flex-grow flex flex-col z-10 p-4 md:p-8">
        <header className="w-full max-w-4xl mx-auto flex justify-between items-center mb-8">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg shadow-lg" />
            <span className="text-xl font-black tracking-widest uppercase bg-clip-text text-transparent bg-gradient-to-r from-slate-100 to-slate-400">
              Rev.Akinator
            </span>
          </div>
        </header>

        <div className="flex-grow flex items-center justify-center">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};
