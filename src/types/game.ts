export type GameStatus =
  | 'IDLE'
  | 'THINKING_PLAYER'
  | 'PLAYING'
  | 'VAR_CHECK'
  | 'WIN'
  | 'GIVE_UP'
  | 'ERROR';

export type AllowedAnswer = 'Yes' | 'No' | 'Probably' | 'Probably Not' | "Don't Know";

export interface ChatLogEntry {
  question: string;
  answer: AllowedAnswer;
  confidence?: number; // 0 to 100% confidence rating
}

export interface GameState {
  status: GameStatus;
  secretPlayer: string | null;
  chatLog: ChatLogEntry[];
  questionCount: number;
}
