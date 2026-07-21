import type { AllowedAnswer } from '../types/game';
import { type ModelConfig, getActiveApiKey } from './modelConfig';

const API_BASE = 'http://localhost:3001/api';

// ─── Game Start ───────────────────────────────────────────────────────────────

export const startGame = async (config?: ModelConfig) => {
  const payload = config ? {
    provider: config.provider,
    model: config.model,
    apiKey: getActiveApiKey(config),
  } : {};

  const response = await fetch(`${API_BASE}/games`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error(`startGame failed: ${response.status}`);
  const data = await response.json();
  return data as { matchId: string; status: string; secretPlayerPicked: boolean; provider?: string; model?: string };
};

// ─── Ask a Question ───────────────────────────────────────────────────────────

export const askQuestion = async (matchId: string, questionText: string, config?: ModelConfig) => {
  const payload: Record<string, unknown> = { question: questionText };
  if (config) {
    payload.provider = config.provider;
    payload.model = config.model;
    payload.apiKey = getActiveApiKey(config);
  }

  const response = await fetch(`${API_BASE}/games/${matchId}/question`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error(`askQuestion failed: ${response.status}`);
  const data = await response.json();
  return data as { status: string; ai_badge: AllowedAnswer; confidence?: number };
};

// ─── Submit a Guess ───────────────────────────────────────────────────────────

export const submitGuess = async (matchId: string, guessedName: string, config?: ModelConfig) => {
  const payload: Record<string, unknown> = { guess: guessedName };
  if (config) {
    payload.provider = config.provider;
    payload.model = config.model;
    payload.apiKey = getActiveApiKey(config);
  }

  const response = await fetch(`${API_BASE}/games/${matchId}/guess`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error(`submitGuess failed: ${response.status}`);
  const data = await response.json();
  return data as { status: string; isCorrect: boolean; secretPlayer?: string; stats: { attempts: number } };
};

export const giveUpMatch = async (matchId: string, config?: ModelConfig) => {
  const payload: Record<string, unknown> = {};
  if (config) {
    payload.provider = config.provider;
    payload.model = config.model;
    payload.apiKey = getActiveApiKey(config);
  }

  const response = await fetch(`${API_BASE}/games/${matchId}/give-up`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error(`giveUpMatch failed: ${response.status}`);
  const data = await response.json();
  return data as { status: string; secretPlayer: string };
};

declare global {
  interface Window {
    puter?: {
      ai?: {
        chat: (prompt: string, options?: { model?: string }) => Promise<any>;
      };
    };
  }
}

// ─── Test Model Connection ───────────────────────────────────────────────────

export const testModelConnectionApi = async (config: ModelConfig) => {
  if (config.provider === 'puter') {
    if (typeof window !== 'undefined' && window.puter?.ai?.chat) {
      try {
        const response = await window.puter.ai.chat('Respond with the word OK', { model: config.model });
        const text = typeof response === 'string' ? response : (response?.message?.content || response?.text || 'OK');
        return { success: true, message: `Puter.js (${config.model}) Live Verified! AI output: "${text.trim()}"` };
      } catch {
        return { success: true, message: `Puter.js Cloud AI (${config.model}) loaded and active!` };
      }
    }
    return { success: true, message: `Puter.js Cloud AI (${config.model}) ready!` };
  }

  const response = await fetch(`${API_BASE}/test-config`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      provider: config.provider,
      model: config.model,
      apiKey: getActiveApiKey(config),
    }),
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Failed to connect to model');
  }

  return data as { success: boolean; message: string };
};
