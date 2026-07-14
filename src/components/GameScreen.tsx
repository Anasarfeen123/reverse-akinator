import React from 'react';
import type { GameState, AnswerType } from '../types/game';
import { StatusBar } from './StatusBar';
import { QuestionBox } from './QuestionBox';
import { ResponseDock } from './ResponseDock';

interface GameScreenProps {
  state: GameState;
  onAnswer: (answer: AnswerType) => void;
}

export const GameScreen: React.FC<GameScreenProps> = ({ state, onAnswer }) => {
  const isLoading = state.status === 'LOADING';

  return (
    <div className="w-full max-w-4xl mx-auto p-4 flex flex-col justify-center min-h-[80vh] animate-in fade-in duration-500">
      <StatusBar questionCount={state.questionCount} maxQuestions={20} />
      
      <QuestionBox 
        question={state.currentQuestion} 
        isLoading={isLoading} 
      />
      
      <ResponseDock 
        onAnswer={onAnswer} 
        disabled={isLoading} 
      />
    </div>
  );
};
