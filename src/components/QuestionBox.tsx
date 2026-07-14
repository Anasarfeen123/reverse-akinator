import React from 'react';

interface QuestionBoxProps {
  question: string;
  isLoading: boolean;
}

export const QuestionBox: React.FC<QuestionBoxProps> = ({ question, isLoading }) => {
  return (
    <div className="w-full max-w-2xl mx-auto min-h-[160px] bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-8 flex items-center justify-center shadow-lg relative overflow-hidden">
      {/* Decorative accent line */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50" />
      
      {isLoading ? (
        <div className="flex flex-col items-center justify-center space-y-4 animate-pulse">
          <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
          <span className="text-cyan-500/70 font-semibold tracking-widest uppercase text-sm">Processing...</span>
        </div>
      ) : (
        <h2 className="text-2xl md:text-3xl font-bold text-center text-slate-100 animate-in slide-in-from-bottom-4 fade-in duration-500">
          "{question}"
        </h2>
      )}
    </div>
  );
};
