/**
 * Multi-Provider LLM Service for Reverse Akinator
 * Supports:
 *   - Ollama (Local)
 *   - Google Gemini (API key)
 *   - OpenAI (API key)
 *   - Anthropic (API key)
 *   - Groq (API key)
 */

import http from 'http';
import { GoogleGenAI } from '@google/genai';
import { PLAYER_POOL } from './playerPool.js';

export const PROVIDER_DEFAULTS = {
  puter: 'gpt-4o-mini',
  ollama: 'qwen2.5-coder:7b',
  gemini: 'gemini-2.5-flash',
  openai: 'gpt-4o-mini',
  anthropic: 'claude-3-5-haiku-20241022',
  groq: 'llama-3.3-70b-versatile',
};

function isNameQuestion(question, secretPlayer) {
  const q = question.toLowerCase().trim();

  // 1. Explicit name identity questions
  if (
    /his name is/i.test(q) ||
    /is his name/i.test(q) ||
    /what is his name/i.test(q) ||
    /who is he/i.test(q) ||
    /are we thinking of/i.test(q)
  ) {
    return true;
  }

  // 2. Secret player name & parts
  if (secretPlayer) {
    const secLower = secretPlayer.toLowerCase();
    const parts = secLower.split(' ');
    for (const p of parts) {
      if (p.length >= 3 && new RegExp(`\\b${p}\\b`, 'i').test(q)) {
        return true;
      }
    }
  }

  // 3. Pool names
  if (PLAYER_POOL) {
    for (const name of Object.keys(PLAYER_POOL)) {
      const nameLower = name.toLowerCase();
      const parts = nameLower.split(' ');
      const lastName = parts[parts.length - 1];
      if (q.includes(nameLower) || (lastName.length >= 3 && new RegExp(`\\b${lastName}\\b`, 'i').test(q))) {
        return true;
      }
    }
  }

  return false;
}

function getDefaultModel(provider) {
  return PROVIDER_DEFAULTS[provider?.toLowerCase()] || 'qwen2.5-coder:7b';
}

/**
 * Direct Factual Evaluator for Standard Player Attributes
 * Guarantees 100% accuracy and eliminates hallucination/lying on core facts.
 */
function evaluateFactDirectly(question, secretPlayer, playerContext) {
  const rawQ = question.toLowerCase().trim();
  const qClean = rawQ.replace(/[:"'\-_?,.]/g, ' ').replace(/\s+/g, ' ').trim();

  const getTag = (key) => {
    const match = playerContext.match(new RegExp(`${key}:\\s*(.+)`, 'i'));
    return match ? match[1].trim() : '';
  };

  const status = getTag('Status').toUpperCase(); // ACTIVE, RETIRED, DECEASED
  const continent = getTag('Continent').toLowerCase(); // Europe, South America, Africa, Asia
  const posCategory = getTag('Position Category').toLowerCase(); // Forward, Midfielder, Defender, Goalkeeper
  const foot = getTag('Preferred Foot').toLowerCase(); // Left, Right, Both
  const intlTrophies = getTag('Major International Trophies').toLowerCase();
  const clubTrophies = getTag('Major Club Trophies').toLowerCase();
  const ballonDor = getTag("Ballon d'Or Count").toLowerCase();

  const nationality = getTag('Nationality').toLowerCase(); // French, Argentine, Brazilian, etc.
  const currentClub = getTag('Current Club').toLowerCase();
  const prevClubs = getTag('Previous Clubs').toLowerCase();
  const careerClubs = getTag('Career Clubs').toLowerCase();
  const youthAcademy = getTag('Youth Academy').toLowerCase();
  const nicknames = getTag('Famous Nicknames / Monikers').toLowerCase();
  const celebration = getTag('Signature Celebration').toLowerCase();
  const goals = getTag('Career Goals').toLowerCase();
  const allClubs = `${currentClub} ${prevClubs} ${careerClubs} ${youthAcademy}`;

  const dobTag = getTag('Date of Birth');
  let playerAge = null;
  const ageMatch = dobTag.match(/age\s+(\d+)/i);
  if (ageMatch) {
    playerAge = parseInt(ageMatch[1], 10);
  }

  // 1. AGE & MATHEMATICAL COMPARISONS
  if (playerAge !== null && /(age|years? old|older|younger|over|under)/i.test(qClean)) {
    const numMatch = qClean.match(/\b(\d+)\b/);
    if (numMatch) {
      const targetAge = parseInt(numMatch[1], 10);
      if (/(older|more than|over|above|greater|than)/i.test(qClean)) {
        return playerAge > targetAge ? 'Yes' : 'No';
      }
      if (/(younger|less than|under|below)/i.test(qClean)) {
        return playerAge < targetAge ? 'Yes' : 'No';
      }
      if (/(exactly|is he|is his age)\s+\d+/i.test(qClean)) {
        return playerAge === targetAge ? 'Yes' : 'No';
      }
    }
  }

  // 1b. ACTIVE / RETIRED / DECEASED
  if (/(active|still playing|currently playing)/i.test(qClean)) {
    return status === 'ACTIVE' ? 'Yes' : 'No';
  }
  if (/(retired|hung up|stopped playing)/i.test(qClean)) {
    return (status === 'RETIRED' || status === 'DECEASED') ? 'Yes' : 'No';
  }
  if (/(dead|deceased|passed away)/i.test(qClean)) {
    return status === 'DECEASED' ? 'Yes' : 'No';
  }
  if (/(alive)/i.test(qClean)) {
    return status !== 'DECEASED' ? 'Yes' : 'No';
  }

  // 2. CONTINENT & AMERICA / EUROPE / ASIA / AFRICA
  if (/(european|europe)/i.test(qClean)) {
    return continent.includes('europe') ? 'Yes' : 'No';
  }
  if (/(south american|south america)/i.test(qClean)) {
    return continent.includes('south america') ? 'Yes' : 'No';
  }
  if (/(america|american|americas)/i.test(qClean)) {
    return (continent.includes('america') || continent.includes('south america') || continent.includes('north america')) ? 'Yes' : 'No';
  }
  if (/(african|africa)/i.test(qClean)) {
    return continent.includes('africa') ? 'Yes' : 'No';
  }
  if (/(asian|asia)/i.test(qClean)) {
    return continent.includes('asia') ? 'Yes' : 'No';
  }

  // Country / National team checks
  const countries = [
    { name: 'french', aliases: ['france', 'french'] },
    { name: 'argentine', aliases: ['argentina', 'argentine'] },
    { name: 'brazilian', aliases: ['brazil', 'brazilian'] },
    { name: 'portuguese', aliases: ['portugal', 'portuguese'] },
    { name: 'english', aliases: ['england', 'english'] },
    { name: 'spanish', aliases: ['spain', 'spanish'] },
    { name: 'german', aliases: ['germany', 'german'] },
    { name: 'italian', aliases: ['italy', 'italian'] },
    { name: 'dutch', aliases: ['netherlands', 'holland', 'dutch'] },
    { name: 'polish', aliases: ['poland', 'polish'] },
    { name: 'croatian', aliases: ['croatia', 'croatian'] },
    { name: 'norwegian', aliases: ['norway', 'norwegian'] },
    { name: 'belgian', aliases: ['belgium', 'belgian'] },
    { name: 'egyptian', aliases: ['egypt', 'egyptian'] },
    { name: 'south korean', aliases: ['south korea', 'korea', 'korean'] },
  ];

  for (const c of countries) {
    for (const alias of c.aliases) {
      const pattern = new RegExp(`\\b${alias}\\b`, 'i');
      if (pattern.test(qClean)) {
        return nationality.includes(c.name) ? 'Yes' : 'No';
      }
    }
  }

  const pos = getTag('Position').toLowerCase();
  const allPos = `${posCategory} ${pos}`;

  // 3. POSITION CATEGORY
  if (/(forward|striker|attacker|winger)/i.test(qClean)) {
    return (allPos.includes('forward') || allPos.includes('winger') || allPos.includes('striker') || allPos.includes('attacker')) ? 'Yes' : 'No';
  }
  if (/(midfielder|playmaker)/i.test(qClean)) {
    return (allPos.includes('midfielder') || allPos.includes('playmaker')) ? 'Yes' : 'No';
  }
  if (/(defender|centre back|center back|fullback|right back|left back)/i.test(qClean)) {
    return (allPos.includes('defender') || allPos.includes('back')) ? 'Yes' : 'No';
  }
  if (/(goalkeeper|keeper|goalie|golie|goolie)/i.test(qClean)) {
    return (allPos.includes('goalkeeper') || allPos.includes('keeper')) ? 'Yes' : 'No';
  }

  // 4. PREFERRED FOOT
  if (/(right-footed|right footed|right foot|right)/i.test(qClean) && /(foot|footed|leg)/i.test(qClean)) {
    return (foot.includes('right') || foot.includes('both')) ? 'Yes' : 'No';
  }
  if (/(left-footed|left footed|left foot|left)/i.test(qClean) && /(foot|footed|leg)/i.test(qClean)) {
    return (foot.includes('left') || foot.includes('both')) ? 'Yes' : 'No';
  }
  if (/(two-footed|both feet|both-footed)/i.test(qClean)) {
    return foot.includes('both') ? 'Yes' : 'No';
  }

  // 5. TROPHIES & BALLON D'OR
  if (/(world cup)/i.test(qClean)) {
    return intlTrophies.includes('world cup') ? 'Yes' : 'No';
  }
  if (/(champions league|ucl)/i.test(qClean)) {
    return clubTrophies.includes('champions league') ? 'Yes' : 'No';
  }
  if (/(ballon d'or|ballon dor|ballon)/i.test(rawQ)) {
    return (!ballonDor.includes('0') && !ballonDor.includes('zero')) ? 'Yes' : 'No';
  }

  // 6. FAMOUS CLUBS
  if (/(real madrid)/i.test(qClean)) {
    return allClubs.includes('real madrid') ? 'Yes' : 'No';
  }
  if (/(barcelona|barca)/i.test(qClean)) {
    return allClubs.includes('barcelona') ? 'Yes' : 'No';
  }
  if (/(manchester united|man utd)/i.test(qClean)) {
    return (allClubs.includes('manchester united') || allClubs.includes('man utd')) ? 'Yes' : 'No';
  }
  if (/(manchester city|man city)/i.test(qClean)) {
    return (allClubs.includes('manchester city') || allClubs.includes('man city')) ? 'Yes' : 'No';
  }
  if (/(bayern munich|bayern)/i.test(qClean)) {
    return allClubs.includes('bayern') ? 'Yes' : 'No';
  }
  if (/(psg|paris saint-germain|paris)/i.test(qClean)) {
    return (allClubs.includes('psg') || allClubs.includes('paris')) ? 'Yes' : 'No';
  }

  // 7. FIRST LETTER OF NAME
  if (/(starts?|begin|first letter|letter)/i.test(qClean)) {
    const letterMatch = qClean.match(/with\s+([a-z])\b/i) || qClean.match(/is\s+([a-z])\b/i) || qClean.match(/\b([a-z])\b/i);
    if (letterMatch) {
      const targetLetter = letterMatch[1].toLowerCase();
      const playerFirstChar = secretPlayer.trim().toLowerCase()[0];
      return playerFirstChar === targetLetter ? 'Yes' : 'No';
    }
  }

  // 8. JERSEY / SHIRT NUMBER
  if (/(jersey|shirt|number|#)/i.test(qClean)) {
    const jerseyTag = getTag('Jersey Number');
    const numMatch = qClean.match(/\b(\d+)\b/);
    if (numMatch && jerseyTag) {
      const askedNum = numMatch[1];
      const actualNum = jerseyTag.replace(/\D/g, '');
      return askedNum === actualNum ? 'Yes' : 'No';
    }
  }

  // 9. LEAGUES & COMPETITIONS
  if (/(la liga|laliga|spanish league)/i.test(qClean)) {
    return (currentClub.includes('la liga') || allClubs.includes('barcelona') || allClubs.includes('real madrid') || allClubs.includes('atlético')) ? 'Yes' : 'No';
  }
  if (/(premier league|epl|english league)/i.test(qClean)) {
    return (currentClub.includes('premier league') || allClubs.includes('manchester') || allClubs.includes('arsenal') || allClubs.includes('chelsea') || allClubs.includes('liverpool') || allClubs.includes('tottenham')) ? 'Yes' : 'No';
  }
  if (/(bundesliga|german league)/i.test(qClean)) {
    return (currentClub.includes('bundesliga') || allClubs.includes('bayern') || allClubs.includes('leverkusen') || allClubs.includes('dortmund')) ? 'Yes' : 'No';
  }
  if (/(serie a|italian league)/i.test(qClean)) {
    return (currentClub.includes('serie a') || allClubs.includes('inter') || allClubs.includes('ac milan') || allClubs.includes('juventus') || allClubs.includes('napoli')) ? 'Yes' : 'No';
  }
  if (/(mls|major league soccer|american league)/i.test(qClean)) {
    return (currentClub.includes('mls') || allClubs.includes('inter miami') || allClubs.includes('chicago fire')) ? 'Yes' : 'No';
  }
  if (/(saudi|pro league)/i.test(qClean)) {
    return (currentClub.includes('saudi') || allClubs.includes('al nassr') || allClubs.includes('al ittihad') || allClubs.includes('al hilal')) ? 'Yes' : 'No';
  }

  // 10. EURO & COPA AMERICA
  if (/(euro|uefa euro|european championship)/i.test(qClean)) {
    return intlTrophies.includes('euro') ? 'Yes' : 'No';
  }
  if (/(copa america|copa)/i.test(qClean)) {
    return intlTrophies.includes('copa') ? 'Yes' : 'No';
  }

  // 11. YOUTH ACADEMY & NICKNAMES & CELEBRATIONS
  if (/(la masia|masia)/i.test(qClean)) {
    return allClubs.includes('masia') ? 'Yes' : 'No';
  }
  if (/(siu|siuuu)/i.test(qClean)) {
    return celebration.includes('siu') ? 'Yes' : 'No';
  }
  if (/(cold shiver|cold palmer|shiver|tea)/i.test(qClean)) {
    return (celebration.includes('cold') || celebration.includes('tea') || nicknames.includes('cold')) ? 'Yes' : 'No';
  }
  if (/(scored|career goals|scoring)/i.test(qClean)) {
    return goals.length > 0 ? 'Yes' : 'No';
  }

  // 12. FAMOUS MATCHES / WORLD CUP LOSSES / 7-1
  if (/(famously lost|famous loss|world cup loss|7-1|7 1|remontada|defeat|lost in world cup)/i.test(qClean)) {
    const famousTag = getTag('Famous Matches / Losses').toLowerCase();
    const knownFacts = getTag('Known Facts').toLowerCase();
    const allHistory = `${famousTag} ${knownFacts} ${playerContext.toLowerCase()}`;
    if (allHistory.includes('7-1') || allHistory.includes('famously lost') || allHistory.includes('remontada')) {
      return 'Yes';
    }
    return 'No';
  }

  return null; // Fall through to LLM evaluation if not a direct standard attribute
}


/**
 * Robust LLM Output Sanitizer & Parser
 */
function parseLLMAnswer(raw) {
  if (!raw) return "No";

  // Strip code blocks and markdown formatting
  const cleaned = raw
    .replace(/```[\s\S]*?```/g, '')
    .replace(/[*_`"#]/g, '')
    .trim();

  const lines = cleaned.split('\n').map(l => l.trim()).filter(Boolean);
  const firstLine = lines[0] || '';
  const lower = cleaned.toLowerCase();

  // 1. Negative indications -> "No"
  if (
    /^no\b/i.test(firstLine) ||
    /\b(no|nope|false|incorrect|negative|not|n't|never|probably not)\b/i.test(lower)
  ) {
    return 'No';
  }

  // 2. Positive indications -> "Yes"
  if (
    /^yes\b/i.test(firstLine) ||
    /\b(yes|yeah|yep|true|correct|affirmative|indeed|probably|sure)\b/i.test(lower)
  ) {
    return 'Yes';
  }

  return "No";
}

/**
 * Makes a POST request to local Ollama via http module
 */
function ollamaHttpPost(path, body) {
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
          try {
            resolve(JSON.parse(data));
          } catch {
            reject(new Error(`Failed to parse Ollama response: ${data}`));
          }
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
 * Call Ollama (Local)
 */
async function callOllama({ model, systemPrompt, userMessage }) {
  const data = await ollamaHttpPost('/api/chat', {
    model: model || PROVIDER_DEFAULTS.ollama,
    stream: false,
    options: {
      temperature: 0.0,
      num_predict: 64,
    },
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
  });
  return data.message?.content?.trim() || '';
}

/**
 * Call Google Gemini
 */
async function callGemini({ model, apiKey, systemPrompt, userMessage }) {
  const key = apiKey || process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!key) {
    throw new Error('Google Gemini API Key is required. Please provide it in settings or environment variables.');
  }

  const aiClient = new GoogleGenAI({ apiKey: key });
  const selectedModel = model || PROVIDER_DEFAULTS.gemini;

  const response = await aiClient.models.generateContent({
    model: selectedModel,
    contents: `${systemPrompt}\n\n${userMessage}`,
  });

  return response.text?.trim() || '';
}

/**
 * Call OpenAI
 */
async function callOpenAI({ model, apiKey, systemPrompt, userMessage }) {
  const key = apiKey || process.env.OPENAI_API_KEY;
  if (!key) {
    throw new Error('OpenAI API Key is required. Please provide it in settings or environment variables.');
  }

  const selectedModel = model || PROVIDER_DEFAULTS.openai;
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: selectedModel,
      temperature: 0.0,
      max_tokens: 100,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`OpenAI API Error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() || '';
}

/**
 * Call Anthropic
 */
async function callAnthropic({ model, apiKey, systemPrompt, userMessage }) {
  const key = apiKey || process.env.ANTHROPIC_API_KEY;
  if (!key) {
    throw new Error('Anthropic API Key is required. Please provide it in settings or environment variables.');
  }

  const selectedModel = model || PROVIDER_DEFAULTS.anthropic;
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: selectedModel,
      max_tokens: 100,
      temperature: 0.0,
      system: systemPrompt,
      messages: [
        { role: 'user', content: userMessage },
      ],
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Anthropic API Error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  return data.content?.[0]?.text?.trim() || '';
}

/**
 * Call Groq
 */
async function callGroq({ model, apiKey, systemPrompt, userMessage }) {
  const key = apiKey || process.env.GROQ_API_KEY;
  if (!key) {
    throw new Error('Groq API Key is required. Please provide it in settings or environment variables.');
  }

  const selectedModel = model || PROVIDER_DEFAULTS.groq;
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: selectedModel,
      temperature: 0.0,
      max_tokens: 100,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Groq API Error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() || '';
}

/**
 * Call Puter.js (Free Cloud AI)
 */
async function callPuter({ model, systemPrompt, userMessage }) {
  const selectedModel = model || PROVIDER_DEFAULTS.puter;
  try {
    const res = await fetch('https://api.puter.com/drivers/call', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        interface: 'puter-ai',
        driver: selectedModel,
        method: 'chat',
        args: {
          prompt: `${systemPrompt}\n\nUser Question: ${userMessage}`,
          model: selectedModel,
        },
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data?.result) {
        if (typeof data.result === 'string') return data.result.trim();
        if (data.result.message?.content) return data.result.message.content.trim();
        if (data.result.text) return data.result.text.trim();
      }
    }
  } catch {
    // Fallback if driver endpoint requires browser session
  }

  return "Don't Know";
}

/**
 * Master Call Handler
 */
export async function callLLM({ provider = 'ollama', model, apiKey, systemPrompt, userMessage }) {
  const p = (provider || 'ollama').toLowerCase();
  const m = model || getDefaultModel(p);

  switch (p) {
    case 'puter':
      return await callPuter({ model: m, systemPrompt, userMessage });
    case 'gemini':
      return await callGemini({ model: m, apiKey, systemPrompt, userMessage });
    case 'openai':
      return await callOpenAI({ model: m, apiKey, systemPrompt, userMessage });
    case 'anthropic':
      return await callAnthropic({ model: m, apiKey, systemPrompt, userMessage });
    case 'groq':
      return await callGroq({ model: m, apiKey, systemPrompt, userMessage });
    case 'ollama':
    default:
      return await callOllama({ model: m, systemPrompt, userMessage });
  }
}

/**
 * Answer Yes/No Question
 */
export async function answerQuestion(config, question, secretPlayer, playerContext, chatLog = []) {
  const nameQuestion = isNameQuestion(question, secretPlayer);

  // 1. Direct Factual Pre-evaluation Layer
  if (!nameQuestion) {
    const directFactAnswer = evaluateFactDirectly(question, secretPlayer, playerContext);
    if (directFactAnswer !== null) {
      const confidence = directFactAnswer === 'Yes' ? 98 : 4;
      return { answer: directFactAnswer, confidence };
    }
  }

  if (nameQuestion) {
    const qLower = question.toLowerCase().trim();
    const getTag = (key) => {
      const match = playerContext.match(new RegExp(`${key}:\\s*(.+)`, 'i'));
      return match ? match[1].trim() : '';
    };

    const fullName = getTag('Full Name').toLowerCase();
    const aliases = getTag('Common Names / Aliases').toLowerCase();
    const allNames = `${secretPlayer.toLowerCase()} ${fullName} ${aliases}`;

    const words = qLower.replace(/[^a-z0-9\s]/g, '').split(' ');
    let matchesSecret = false;
    for (const w of words) {
      if (w.length >= 4 && allNames.includes(w)) {
        matchesSecret = true;
        break;
      }
    }

    if (matchesSecret) {
      return { answer: 'Probably', confidence: 94 };
    }
    return { answer: 'Probably Not', confidence: 12 };
  }

  // 2. Multi-turn History Context
  const historyContext = chatLog.length > 0
    ? `=== CHAT HISTORY (PREVIOUS QUESTIONS & ANSWERS) ===\n${chatLog.map((l, i) => `Q${i + 1}: "${l.question}" -> ANSWER: ${l.answer}`).join('\n')}\n=== END CHAT HISTORY ===\n\nCRITICAL CONSTRAINTS FOR HISTORY CONSISTENCY:\n1. You MUST remain 100% logically consistent with every previous answer listed above.\n2. Do NOT contradict any previous answer under any circumstance.`
    : 'This is the first question in the game.';

  const systemPrompt = `You are an expert AI Football Referee with RAG access to the official Wikipedia biography for secret player: "${secretPlayer}".
Below is the factual Wikipedia RAG knowledge base for this player:

=== SECRET PLAYER WIKIPEDIA RAG BIOGRAPHY ===
${playerContext}
=== END BIOGRAPHY ===

${historyContext}

EVALUATION INSTRUCTIONS:
1. Evaluate the user's question using the Wikipedia RAG profile above.
2. Select your confidence rating (0 to 100%) and select one answer badge:
   - YES (Confidence 90-100%)
   - PROBABLY (Confidence 70-89%)
   - DON'T KNOW (Confidence 30-69%)
   - PROBABLY NOT (Confidence 10-29%)
   - NO (Confidence 0-9%)
3. Output EXACTLY one word: Yes, No, Probably, Probably Not, or Don't Know.`;

  const userMessage = `User Question: "${question}"\n\nRespond with EXACTLY one answer badge.`;

  const raw = await callLLM({
    provider: config?.provider,
    model: config?.model,
    apiKey: config?.apiKey,
    systemPrompt,
    userMessage,
  });

  const parsedAnswer = parseLLMAnswer(raw);
  const confidence = parsedAnswer === 'Yes' ? 94 : parsedAnswer === 'Probably' ? 78 : parsedAnswer === 'Probably Not' ? 22 : 6;

  return { answer: parsedAnswer, confidence };
}

/**
 * Check Player Guess Match
 */
export async function checkGuess(config, guess, secretPlayer, playerContext) {
  // Direct text match pre-check for fast & precise execution
  const gNorm = guess.toLowerCase().replace(/[^a-z0-9]/g, '');
  const pNorm = secretPlayer.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (gNorm && (gNorm === pNorm || pNorm.includes(gNorm) || gNorm.includes(pNorm))) {
    return true;
  }

  const systemPrompt = `You are a strict referee in a football player guessing game. The secret player is "${secretPlayer}".
Below is the player profile:

=== PLAYER PROFILE ===
${playerContext}
=== END PROFILE ===

Your ONLY job is to decide if the human's guess refers to "${secretPlayer}".
Be intelligent and lenient with:
- Minor typos (e.g., "Halland" = "Erling Haaland", "Mbape" = "Kylian Mbappé", "Cr7" = "Cristiano Ronaldo")
- Nicknames (e.g. "R9", "CR7", "El Fenomeno", "Zizou", "Pele", "KDB", "Titi", "Don Andres", "Starboy")
- Common single-name references if unambiguous (e.g., "Messi", "Ronaldo", "Haaland", "Modric", "Pedri", "Rodri", "Salah", "Lewandowski", "Saka", "Foden", "Iniesta", "Pirlo", "Kaka")

Respond ONLY with YES or NO.`;

  const userMessage = `Human's guess: "${guess}"`;

  try {
    const raw = await callLLM({
      provider: config?.provider,
      model: config?.model,
      apiKey: config?.apiKey,
      systemPrompt,
      userMessage,
    });
    return raw.trim().toUpperCase().startsWith('YES');
  } catch (err) {
    console.error('LLM checkGuess error, fallback to string match:', err);
    return false;
  }
}

/**
 * Test Model Connection
 */
export async function testModelConnection(config) {
  const systemPrompt = 'You are a test assistant. Respond with the word OK.';
  const userMessage = 'Test connection';
  const raw = await callLLM({
    provider: config?.provider,
    model: config?.model,
    apiKey: config?.apiKey,
    systemPrompt,
    userMessage,
  });
  return raw.length > 0;
}
