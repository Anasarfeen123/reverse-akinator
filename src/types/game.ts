export type GameStatus = 'INTRO' | 'ASKING' | 'LOADING' | 'WIN' | 'LOSE';

export type AnswerType = 'Yes' | 'Probably' | 'Don\'t Know' | 'Probably Not' | 'No';

export interface ChatMessage {
  question: string;
  answer: AnswerType;
}

export interface GameState {
  status: GameStatus;
  questionCount: number;
  currentQuestion: string;
  guessedPlayer: string | null;
  chatLog: ChatMessage[];
}
