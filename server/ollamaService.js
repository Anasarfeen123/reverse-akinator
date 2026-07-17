/**
 * Ollama Service — ES module, uses Node's built-in http module
 * (avoids fetch() issues with localhost on Windows)
 *
 * Model: qwen2.5-coder:7b — best available for structured instruction following.
 */

import http from 'http';
import { GUESSING_POOL } from './playerPool.js';

// Preferred model order. The first one that is actually pulled into Ollama
// wins, so the backend works no matter which qwen model you have installed.
const PREFERRED_MODELS = [
  'qwen2.5-coder:7b',
  'qwen2.5-coder:3b',
  'qwen2.5:7b',
  'qwen2.5:3b',
  'qwen2.5:1.5b',
  'qwen3:latest',
  'qwen2.5:latest',
];

export let MODEL = PREFERRED_MODELS[0];

// The secret player is ALWAYS one of the most popular FIFA / football icons
// below. This list is injected into every prompt so the model stays inside
// the valid guessing universe and never invents players.
const POOL_LIST = GUESSING_POOL.join(', ');

/**
 * Lists models currently pulled into the local Ollama server.
 */
export async function listOllamaModels() {
  try {
    const data = await httpGet('/api/tags');
    return (data.models || []).map(m => m.name);
  } catch {
    return [];
  }
}

/**
 * Resolves the best available model at startup. Prefers a qwen variant
 * (for structured instruction following) and falls back to any pulled model.
 */
async function resolveModel() {
  const available = await listOllamaModels();
  if (available.length === 0) return; // Ollama not running — keep default

  const preferred = PREFERRED_MODELS.find(m => available.includes(m));
  if (preferred) { MODEL = preferred; return; }

  // No exact match: prefer the first available model whose name includes "qwen"
  const qwen = available.find(m => /qwen/i.test(m));
  if (qwen) { MODEL = qwen; return; }

  // Last resort: use whatever is available
  MODEL = available[0];
}

// Kick off model resolution and expose a promise so requests wait for it.
export const modelReady = resolveModel();

// Regex patterns that indicate someone is asking about the player's name/identity
const NAME_QUESTION_PATTERNS = [
  /is (it|this|the player|his name|the answer)/i,
  /is (your|the) (player|name|answer)/i,
  /are (you|they)/i,
  /his name/i,
  /what('s| is) (the|his|your) name/i,
  /who is/i,
  /are we thinking of/i,
  /is the player/i,
];

function isNameQuestion(question) {
  return NAME_QUESTION_PATTERNS.some(p => p.test(question));
}

/**
 * Makes a POST request to the local Ollama server using Node's http module.
 */
function httpPost(path, body) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body);
    const options = {
      hostname: '127.0.0.1',
      port: 11434,
      path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`Ollama HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

/**
 * Makes a GET request to the local Ollama server (used for /api/tags).
 */
function httpGet(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: '127.0.0.1',
      port: 11434,
      path,
      method: 'GET',
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`Ollama HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

/**
 * Sends a chat request to Ollama and returns the raw text response.
 */
async function ollamaChat(systemPrompt, userMessage) {
  await modelReady; // ensure MODEL has been resolved against Ollama
  const data = await httpPost('/api/chat', {
    model: MODEL,
    stream: false,
    options: {
      temperature: 0.1,
      num_predict: 32,   // Slightly higher to avoid mid-word cutoffs
    },
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user',   content: userMessage  },
    ],
  });
  return data.message?.content?.trim() || '';
}

/**
 * Asks Ollama a yes/no style question about the secret player.
 * Uses the player's RAG context so the model doesn't need live knowledge.
 *
 * Special handling: if the question asks about the player's NAME or IDENTITY
 * (e.g. "Is it Messi?", "What's the player's name?"), respond with
 * "Probably" or "Probably Not" — never a hard Yes/No to avoid spoiling the game.
 *
 * Returns one of: "Yes", "No", "Probably", "Probably Not", "Don't Know"
 */
export async function answerQuestion(question, secretPlayer, playerContext, chatLog = []) {
  const historyContext = chatLog.length > 0
    ? `History of questions already asked and answered:\n${chatLog.map((l, i) => `Q${i + 1}: ${l.question} -> ${l.answer}`).join('\n')}\n\nYou MUST remain consistent with these previous answers.`
    : 'This is the first question in the game.';

  // Determine if this is a name/identity question — special prompt branch
  const nameQuestion = isNameQuestion(question);

  const nameGuardNote = nameQuestion
    ? `IMPORTANT: This question is asking about the player's NAME or IDENTITY. You must NEVER answer "Yes" or "No" to such questions as it would spoil the game. Instead, respond with "Probably" if the guess is plausible/correct, or "Probably Not" if it is wrong/implausible. This is the only exception to the Yes/No rule.`
    : '';

  const systemPrompt = `You are the AI referee in a game of REVERSE AKINATOR. The HUMAN is trying to guess which football player YOU have secretly picked. Your job is to answer the human's yes/no questions truthfully so they can figure it out.

CRITICAL CONSTRAINT — THE GUESSING POOL:
The secret player is ALWAYS one of these most popular FIFA / football icons:
${POOL_LIST}
Never pick, mention, or accept any player outside this list. If asked about someone not in this list, the answer is "No".

YOUR SECRET PLAYER PROFILE (your ONLY source of truth):
=== PLAYER PROFILE ===
${playerContext}
=== END PROFILE ===

${historyContext}

${nameGuardNote}

STRICT RULES:
1. Answer ONLY using the player profile above. Never use outside football knowledge.
2. Reply with EXACTLY ONE of these five words, nothing else — no punctuation, no explanation:
   Yes
   No
   Probably
   Probably Not
   Don't Know
3. Use "Probably" / "Probably Not" for half-true, uncertain, or ambiguous facts, and ALWAYS for name/identity questions.
4. Use "Don't Know" only when a question is not a yes/no question or is not covered by the profile.
5. NEVER reveal the player's name or any identifying detail beyond what the question asks.
6. Stay 100% consistent with every previous answer in the history above.
7. Never guess the player's identity. Let the human do the guessing.`;

  const userMessage = `Question: "${question}"\n\nRespond with exactly one of: Yes, No, Probably, Probably Not, Don't Know`;

  const raw = await ollamaChat(systemPrompt, userMessage);

  // Parse the response robustly
  const lower = raw.toLowerCase();
  let answer;
  if (lower.includes('probably not')) answer = 'Probably Not';
  else if (lower.includes('probably')) answer = 'Probably';
  else if (lower.includes("don't know") || lower.includes("dont know")) answer = "Don't Know";
  else if (lower.includes('yes')) answer = 'Yes';
  else if (lower.includes('no'))  answer = 'No';
  else answer = "Don't Know";

  // SAFETY OVERRIDE: name/identity questions must never be a hard Yes or No
  // — convert to Probably / Probably Not regardless of what the model said
  if (nameQuestion) {
    if (answer === 'Yes') return 'Probably';
    if (answer === 'No')  return 'Probably Not';
  }

  return answer;
}

/**
 * Checks if the human's guess matches the secret player using fuzzy Ollama matching.
 * Returns boolean.
 */
export async function checkGuess(guess, secretPlayer, playerContext) {
  const systemPrompt = `You are a strict judge in a football guessing game.
The secret player is one of these most popular FIFA / football icons:
${POOL_LIST}

The actual secret player is described in this profile:

=== PLAYER PROFILE ===
${playerContext}
=== END PROFILE ===

Decide ONLY whether the human's guess refers to the exact same person as the player in the profile.
Be lenient with:
- Spelling mistakes (e.g. "Halland" = "Erling Haaland" is correct)
- Nicknames (e.g. "R9", "CR7", "El Fenomeno", "Zizou", "Pele" are all correct)
- Partial names (e.g. "Messi", "Ronaldo", "Haaland" if clearly unambiguous)

Respond with ONLY the single word YES or NO.`;

  const userMessage = `Human's guess: "${guess}"`;

  const raw = await ollamaChat(systemPrompt, userMessage);
  return raw.trim().toUpperCase().startsWith('YES');
}
