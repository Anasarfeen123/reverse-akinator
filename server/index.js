/**
 * Reverse Akinator — Express Backend (ES module)
 *
 * Endpoints consumed by src/services/api.ts:
 *   GET  /api/models                 → get available providers and default models
 *   POST /api/test-config            → test model connection / API key
 *   POST /api/games                  → startGame (accepts provider, model, apiKey)
 *   POST /api/games/:id/question     → askQuestion
 *   POST /api/games/:id/guess        → submitGuess
 */

import express from 'express';
import cors    from 'cors';
import { pickRandomPlayer, getPlayerContext, PLAYER_POOL } from './playerPool.js';
import { answerQuestion, checkGuess, testModelConnection, PROVIDER_DEFAULTS } from './llmService.js';

const app  = express();
const PORT = 3001;

app.use(cors({ origin: '*' }));
app.use(express.json());

// In-memory sessions: matchId → { secretPlayer, playerContext, chatLog, config: { provider, model, apiKey } }
const sessions = new Map();

function generateMatchId() {
  return `match_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

// ─── GET /api/models ──────────────────────────────────────────────────────────
app.get('/api/models', (req, res) => {
  res.json({
    providers: [
      { id: 'ollama', name: 'Ollama (Local LLM)', requiresApiKey: false, defaultModel: PROVIDER_DEFAULTS.ollama },
      { id: 'gemini', name: 'Google Gemini', requiresApiKey: true, defaultModel: PROVIDER_DEFAULTS.gemini },
      { id: 'openai', name: 'OpenAI', requiresApiKey: true, defaultModel: PROVIDER_DEFAULTS.openai },
      { id: 'anthropic', name: 'Anthropic Claude', requiresApiKey: true, defaultModel: PROVIDER_DEFAULTS.anthropic },
      { id: 'groq', name: 'Groq', requiresApiKey: true, defaultModel: PROVIDER_DEFAULTS.groq },
    ],
    defaults: PROVIDER_DEFAULTS,
  });
});

// ─── POST /api/test-config ───────────────────────────────────────────────────
app.post('/api/test-config', async (req, res) => {
  const { provider = 'ollama', model, apiKey } = req.body;
  try {
    await testModelConnection({ provider, model, apiKey });
    res.json({ success: true, message: `Successfully connected to ${provider} (${model || PROVIDER_DEFAULTS[provider]})!` });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// ─── POST /api/games ──────────────────────────────────────────────────────────
app.post('/api/games', (req, res) => {
  const { provider = 'ollama', model, apiKey } = req.body || {};
  const secretPlayer  = pickRandomPlayer();
  const playerContext = getPlayerContext(secretPlayer);
  const matchId       = generateMatchId();

  const selectedModel = model || PROVIDER_DEFAULTS[provider] || PROVIDER_DEFAULTS.ollama;

  sessions.set(matchId, {
    secretPlayer,
    playerContext,
    chatLog: [],
    config: { provider, model: selectedModel, apiKey }
  });

  console.log('');
  console.log('═══════════════════════════════════════════════');
  console.log('  NEW GAME STARTED');
  console.log(`  Secret Player : ${secretPlayer}`);
  console.log(`  Provider      : ${provider}`);
  console.log(`  Model         : ${selectedModel}`);
  console.log(`  Match ID      : ${matchId}`);
  console.log('═══════════════════════════════════════════════');
  console.log('');

  res.json({ matchId, status: 'ready', secretPlayerPicked: true, provider, model: selectedModel });
});

// ─── POST /api/games/:matchId/question ───────────────────────────────────────
app.post('/api/games/:matchId/question', async (req, res) => {
  const { matchId }  = req.params;
  const { question, provider, model, apiKey } = req.body;

  if (!question?.trim()) {
    return res.status(400).json({ error: 'Question is required' });
  }

  const session = sessions.get(matchId);
  if (!session) {
    return res.status(404).json({ error: 'Match not found' });
  }

  // Allow request overrides or use session config
  const llmConfig = {
    provider: provider || session.config.provider,
    model: model || session.config.model,
    apiKey: apiKey || session.config.apiKey,
  };

  try {
    const qNum = session.chatLog.length + 1;
    console.log(`  Q${qNum} [${llmConfig.provider}/${llmConfig.model}]: "${question}"`);

    const result = await answerQuestion(
      llmConfig,
      question,
      session.secretPlayer,
      session.playerContext,
      session.chatLog
    );

    const badge = typeof result === 'object' ? result.answer : result;
    const confidence = typeof result === 'object' ? result.confidence : (badge === 'Yes' ? 95 : badge === 'Probably' ? 78 : badge === 'Probably Not' ? 20 : 5);

    session.chatLog.push({ question, answer: badge, confidence });
    console.log(`  A${qNum}: ${badge} (${confidence}% Confidence)`);

    res.json({ status: 'success', ai_badge: badge, confidence });
  } catch (err) {
    console.error(`  ERROR: ${err.message}`);
    res.status(500).json({ error: 'AI service error', detail: err.message });
  }
});

// ─── POST /api/games/:matchId/guess ──────────────────────────────────────────
app.post('/api/games/:matchId/guess', async (req, res) => {
  const { matchId } = req.params;
  const { guess, provider, model, apiKey }   = req.body;

  if (!guess?.trim()) {
    return res.status(400).json({ error: 'Guess is required' });
  }

  const session = sessions.get(matchId);
  if (!session) {
    return res.status(404).json({ error: 'Match not found' });
  }

  const llmConfig = {
    provider: provider || session.config.provider,
    model: model || session.config.model,
    apiKey: apiKey || session.config.apiKey,
  };

  try {
    console.log(`  GUESS [${llmConfig.provider}/${llmConfig.model}]: "${guess}"`);

    const isCorrect = await checkGuess(llmConfig, guess, session.secretPlayer, session.playerContext);

    if (isCorrect) {
      console.log(`  CORRECT! Player was: ${session.secretPlayer}`);
      sessions.delete(matchId);
    } else {
      console.log(`  WRONG. Secret player is still: ${session.secretPlayer}`);
    }

    const payload = {
      status: 'success',
      isCorrect,
      stats: { attempts: 1 },
    };

    if (isCorrect) {
      payload.secretPlayer = session.secretPlayer;
    }

    res.json(payload);
  } catch (err) {
    console.error(`  ERROR: ${err.message}`);
    res.status(500).json({ error: 'AI service error', detail: err.message });
  }
});

// ─── POST /api/games/:matchId/give-up ────────────────────────────────────────
app.post('/api/games/:matchId/give-up', (req, res) => {
  const { matchId } = req.params;
  const session = sessions.get(matchId);

  if (!session) {
    return res.status(404).json({ error: 'Match not found' });
  }

  const secretPlayer = session.secretPlayer;
  sessions.delete(matchId);

  console.log(`  GIVE UP [${matchId}]: revealing ${secretPlayer}`);

  res.json({
    status: 'success',
    secretPlayer,
  });
});

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log('');
  console.log('═══════════════════════════════════════════════');
  console.log('  Reverse Akinator backend running');
  console.log(`  http://localhost:${PORT}`);
  console.log(`  RAG    : ${Object.keys(PLAYER_POOL).length} 100% active FIFA players loaded`);
  console.log('  Models : Multi-provider (Ollama, Gemini, OpenAI, Anthropic, Groq)');
  console.log('═══════════════════════════════════════════════');
  console.log('');
});
