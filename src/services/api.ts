import type { AllowedAnswer } from '../types/game';

const API_BASE = 'http://localhost:3001/api';

// ─── Game Start ───────────────────────────────────────────────────────────────

export const startGame = async () => {
  const response = await fetch(`${API_BASE}/games`, { method: 'POST' });
  if (!response.ok) throw new Error(`startGame failed: ${response.status}`);
  const data = await response.json();
  return data as { matchId: string; status: string; secretPlayerPicked: boolean };
};

// ─── Ask a Question ───────────────────────────────────────────────────────────

export const askQuestion = async (matchId: string, questionText: string) => {
  const response = await fetch(`${API_BASE}/games/${matchId}/question`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question: questionText }),
  });
  if (!response.ok) throw new Error(`askQuestion failed: ${response.status}`);
  const data = await response.json();
  return data as { status: string; ai_badge: AllowedAnswer; secretPlayer: string };
};

// ─── Submit a Guess ───────────────────────────────────────────────────────────

export const submitGuess = async (matchId: string, guessedName: string) => {
  const response = await fetch(`${API_BASE}/games/${matchId}/guess`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ guess: guessedName }),
  });
  if (!response.ok) throw new Error(`submitGuess failed: ${response.status}`);
  const data = await response.json();
  return data as { status: string; isCorrect: boolean; secretPlayer: string; stats: { attempts: number } };
};
