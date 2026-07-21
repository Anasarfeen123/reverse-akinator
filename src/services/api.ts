import type { AllowedAnswer } from '../types/game';
import { type ModelConfig, getActiveApiKey } from './modelConfig';

const isLocalHost =
  typeof window !== 'undefined' &&
  /^(localhost|127\.0\.0\.1)$/i.test(window.location.hostname);

const API_BASE =
  import.meta.env.VITE_API_BASE ||
  (isLocalHost ? 'http://localhost:3001/api' : '/api');

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
    const puterToken = config.apiKeys.puter;

    if (puterToken) {
      const response = await fetch('https://api.puter.com/puterai/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${puterToken}`,
        },
        body: JSON.stringify({
          model: config.model,
          temperature: 0,
          max_tokens: 32,
          messages: [{ role: 'user', content: 'Respond with the word OK' }],
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Puter API Error (${response.status}): ${errText}`);
      }

      const data = await response.json();
      const text = data?.choices?.[0]?.message?.content?.trim() || 'OK';
      return { success: true, message: `Puter auth token verified. AI output: "${text}"` };
    }

    if (typeof window !== 'undefined' && window.puter?.ai?.chat) {
      try {
        const response = await window.puter.ai.chat('Respond with the word OK', { model: config.model });
        const text = typeof response === 'string' ? response : (response?.message?.content || response?.text || 'OK');
        return { success: true, message: `Puter.js browser SDK is loaded. AI output: "${text.trim()}". Add a Puter auth token if backend game answers still fail.` };
      } catch {
        return { success: false, message: `Puter.js browser SDK could not complete a test call. Try signing in to Puter or add a Puter auth token.` };
      }
    }

    return { success: false, message: 'Puter is not authenticated. Add a Puter auth token or sign in with Puter in the browser first.' };
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
