import React from 'react';

interface StatusBarProps {
  questionCount: number;
  maxQuestions: number;
}

export const StatusBar: React.FC<StatusBarProps> = ({ questionCount, maxQuestions }) => {
  const progress = (questionCount / maxQuestions) * 100;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-2 mb-6">
      <div className="flex justify-between items-center text-sm font-semibold text-slate-400 uppercase tracking-wider">
        <span>Question</span>
        <span className="text-cyan-400 font-bold">{questionCount} / {maxQuestions}</span>
      </div>
      <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden shadow-inner">
        <div 
          className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};
