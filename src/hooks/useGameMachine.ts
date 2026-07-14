import { useState, useCallback } from 'react';
import type { GameState, AnswerType } from '../types/game';

const INITIAL_STATE: GameState = {
  status: 'INTRO',
  questionCount: 0,
  currentQuestion: '',
  guessedPlayer: null,
  chatLog: [],
};

const MAX_QUESTIONS = 20;

export function useGameMachine() {
  const [state, setState] = useState<GameState>(INITIAL_STATE);

  const startGame = useCallback(() => {
    setState({
      ...INITIAL_STATE,
      status: 'LOADING',
    });

    // Mock first question fetch
    setTimeout(() => {
      setState((prev) => ({
        ...prev,
        status: 'ASKING',
        currentQuestion: 'Does your player play in the Premier League?',
        questionCount: 1,
      }));
    }, 1000);
  }, []);

  const submitAnswer = useCallback(
    async (answer: AnswerType) => {
      if (state.status !== 'ASKING') return;

      const newLog = [...state.chatLog, { question: state.currentQuestion, answer }];

      if (state.questionCount >= MAX_QUESTIONS) {
        setState((prev) => ({
          ...prev,
          status: 'LOADING',
          chatLog: newLog,
        }));
        // Mock defeat API call when reaching max questions
        setTimeout(() => {
          setState((prev) => ({
            ...prev,
            status: 'LOSE',
          }));
        }, 1500);
        return;
      }

      setState((prev) => ({
        ...prev,
        status: 'LOADING',
        chatLog: newLog,
      }));

      // Mock API call
      try {
        const responseText = await mockBackendCall(newLog, state.questionCount);
        
        // Parse response according to requirements
        if (responseText.startsWith('GUESS: ')) {
          const playerName = responseText.replace('GUESS: ', '').trim();
          setState((prev) => ({
            ...prev,
            status: 'WIN',
            guessedPlayer: playerName,
          }));
        } else if (responseText.startsWith('DEFEAT:')) {
          setState((prev) => ({
            ...prev,
            status: 'LOSE',
          }));
        } else {
          setState((prev) => ({
            ...prev,
            status: 'ASKING',
            currentQuestion: responseText,
            questionCount: prev.questionCount + 1,
          }));
        }
      } catch (error) {
        // Fallback on error
        console.error("API Error", error);
        setState((prev) => ({
          ...prev,
          status: 'LOSE',
        }));
      }
    },
    [state]
  );

  const restartGame = useCallback(() => {
    setState(INITIAL_STATE);
  }, []);

  return {
    state,
    startGame,
    submitAnswer,
    restartGame,
  };
}

// Mocking the backend LLM logic for the sake of the frontend structure
const mockBackendCall = (_chatLog: any[], questionCount: number): Promise<string> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (questionCount === 3) {
        resolve('GUESS: Lionel Messi');
      } else if (questionCount === 19) {
        resolve('DEFEAT:');
      } else {
        const fakeQuestions = [
          'Is your player left-footed?',
          'Has your player won the Ballon d\'Or?',
          'Is your player from South America?',
          'Does your player play as a forward?',
        ];
        resolve(fakeQuestions[questionCount % fakeQuestions.length]);
      }
    }, 1500);
  });
};
