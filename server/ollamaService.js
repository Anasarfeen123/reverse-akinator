/**
 * Ollama Service — ES module, uses Node's built-in http module
 * (avoids fetch() issues with localhost on Windows)
 *
 * Model: qwen2.5-coder:7b — best available for structured instruction following.
 */

import http from 'http';

export const MODEL = 'qwen2.5-coder:7b';

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
 * Sends a chat request to Ollama and returns the raw text response.
 */
async function ollamaChat(systemPrompt, userMessage) {
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

  const systemPrompt = `You are the AI referee in a game of Reverse Akinator. You have secretly chosen a football player. Below is factual information about this player — use it as your ONLY source of truth.

=== PLAYER PROFILE ===
${playerContext}
=== END PROFILE ===

${historyContext}

${nameGuardNote}

STRICT RULES:
1. Answer ONLY based on the player profile above.
2. Your response MUST be exactly one of these five options (copy exactly, no punctuation, no extra text):
   Yes
   No
   Probably
   Probably Not
   Don't Know
3. Use "Probably" / "Probably Not" for things that are partially true, uncertain, or for name/identity questions.
4. Use "Don't Know" if the question is not answerable as yes/no or is not covered by the profile.
5. Do NOT reveal the player's name. Do NOT add any explanation.`;

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
  const systemPrompt = `You are a strict judge in a football guessing game. The secret player is described in this profile:

=== PLAYER PROFILE ===
${playerContext}
=== END PROFILE ===

Your ONLY job is to decide if the human's guess refers to the same person as the player in the profile.
Be lenient with:
- Spelling mistakes (e.g. "Halland" = "Erling Haaland" is correct)
- Nicknames (e.g. "R9", "CR7", "El Fenomeno", "Zizou", "Pele" are all correct)
- Partial names (e.g. "Messi", "Ronaldo", "Haaland" if clearly unambiguous)

Respond with ONLY the word YES or NO.`;

  const userMessage = `Human's guess: "${guess}"`;

  const raw = await ollamaChat(systemPrompt, userMessage);
  return raw.trim().toUpperCase().startsWith('YES');
}
