import React from 'react';
import type { AnswerType } from '../types/game';

interface ResponseDockProps {
  onAnswer: (answer: AnswerType) => void;
  disabled: boolean;
}

const BUTTON_CONFIG: { label: AnswerType; colorClass: string }[] = [
  { label: 'Yes', colorClass: 'bg-emerald-600 hover:bg-emerald-500 ring-emerald-500/50' },
  { label: 'Probably', colorClass: 'bg-teal-600 hover:bg-teal-500 ring-teal-500/50' },
  { label: 'Don\'t Know', colorClass: 'bg-slate-600 hover:bg-slate-500 ring-slate-500/50' },
  { label: 'Probably Not', colorClass: 'bg-rose-700 hover:bg-rose-600 ring-rose-700/50' },
  { label: 'No', colorClass: 'bg-rose-500 hover:bg-rose-400 ring-rose-500/50' },
];

export const ResponseDock: React.FC<ResponseDockProps> = ({ onAnswer, disabled }) => {
  return (
    <div className="w-full max-w-2xl mx-auto mt-8 grid grid-cols-2 md:grid-cols-5 gap-3">
      {BUTTON_CONFIG.map(({ label, colorClass }, index) => {
        // Make the "Don't Know" button span full width on small screens
        const isCenter = index === 2;
        const colSpan = isCenter ? 'col-span-2 md:col-span-1' : 'col-span-1';

        return (
          <button
            key={label}
            onClick={() => onAnswer(label)}
            disabled={disabled}
            className={`
              ${colSpan} ${colorClass} 
              text-white font-bold py-4 px-2 rounded-xl text-sm md:text-base uppercase tracking-wider
              transition-all duration-200 
              active:scale-95 hover:ring-4 hover:shadow-lg
              disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 disabled:hover:ring-0 disabled:hover:shadow-none
            `}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
};
