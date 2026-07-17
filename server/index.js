/**
 * Reverse Akinator — Express Backend (ES module)
 *
 * Endpoints consumed by src/services/api.ts:
 *   POST /api/games                  → startGame
 *   POST /api/games/:id/question     → askQuestion
 *   POST /api/games/:id/guess        → submitGuess
 *
 * Model: qwen2.5-coder:7b via Ollama (local)
 * RAG:   Player profiles in playerPool.js injected as context
 */

import express from 'express';
import cors    from 'cors';
import { pickRandomPlayer, getPlayerContext, GUESSING_POOL } from './playerPool.js';
import { answerQuestion, checkGuess, MODEL, modelReady, listOllamaModels }  from './ollamaService.js';

const app  = express();
const PORT = 3001;

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

// In-memory sessions: matchId → { secretPlayer, playerContext, chatLog }
const sessions = new Map();

function generateMatchId() {
  return `match_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

// ─── POST /api/games ──────────────────────────────────────────────────────────
app.post('/api/games', (req, res) => {
  const secretPlayer  = pickRandomPlayer();
  const playerContext = getPlayerContext(secretPlayer);
  const matchId       = generateMatchId();

  sessions.set(matchId, { secretPlayer, playerContext, chatLog: [] });

  console.log('');
  console.log('═══════════════════════════════════════════════');
  console.log('  NEW GAME STARTED');
  console.log(`  Secret Player : ${secretPlayer}`);
  console.log(`  Model         : ${MODEL}`);
  console.log(`  Match ID      : ${matchId}`);
  console.log('═══════════════════════════════════════════════');
  console.log('');

  res.json({ matchId, status: 'ready', secretPlayerPicked: true });
});

// ─── POST /api/games/:matchId/question ───────────────────────────────────────
app.post('/api/games/:matchId/question', async (req, res) => {
  const { matchId }  = req.params;
  const { question } = req.body;

  if (!question?.trim()) {
    return res.status(400).json({ error: 'Question is required' });
  }

  const session = sessions.get(matchId);
  if (!session) {
    return res.status(404).json({ error: 'Match not found' });
  }

  try {
    const qNum = session.chatLog.length + 1;
    console.log(`  Q${qNum}: "${question}"`);

    const badge = await answerQuestion(
      question,
      session.secretPlayer,
      session.playerContext,
      session.chatLog
    );

    session.chatLog.push({ question, answer: badge });
    console.log(`  A${qNum}: ${badge}`);

    res.json({ status: 'success', ai_badge: badge, secretPlayer: session.secretPlayer });
  } catch (err) {
    console.error(`  ERROR: ${err.message}`);
    res.status(500).json({ error: 'AI service error', detail: err.message });
  }
});

// ─── POST /api/games/:matchId/guess ──────────────────────────────────────────
app.post('/api/games/:matchId/guess', async (req, res) => {
  const { matchId } = req.params;
  const { guess }   = req.body;

  if (!guess?.trim()) {
    return res.status(400).json({ error: 'Guess is required' });
  }

  const session = sessions.get(matchId);
  if (!session) {
    return res.status(404).json({ error: 'Match not found' });
  }

  try {
    console.log(`  GUESS: "${guess}"`);

    const isCorrect = await checkGuess(guess, session.secretPlayer, session.playerContext);

    if (isCorrect) {
      console.log(`  CORRECT! Player was: ${session.secretPlayer}`);
      sessions.delete(matchId);
    } else {
      console.log(`  WRONG. Secret player is still: ${session.secretPlayer}`);
    }

    res.json({
      status: 'success',
      isCorrect,
      secretPlayer: session.secretPlayer,
      stats: { attempts: 1 },
    });
  } catch (err) {
    console.error(`  ERROR: ${err.message}`);
    res.status(500).json({ error: 'AI service error', detail: err.message });
  }
});

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, async () => {
  await modelReady; // reflect the actually-resolved model in the banner
  console.log('');
  console.log('═══════════════════════════════════════════════');
  console.log('  Reverse Akinator backend running');
  console.log(`  http://localhost:${PORT}`);
  console.log(`  Model  : ${MODEL}`);
  console.log(`  RAG    : ${GUESSING_POOL.length}-player knowledge base loaded`);
  if (MODEL === 'qwen2.5-coder:7b' && !(await listOllamaModels?.() ?? []).includes(MODEL)) {
    console.log('  WARNING: preferred model not found — using a fallback.');
    console.log('  Run: ollama pull qwen2.5-coder:7b  for best results.');
  }
  console.log('═══════════════════════════════════════════════');
  console.log('');
});
