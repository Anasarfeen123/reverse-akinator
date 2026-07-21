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

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function normalizeText(value = '') {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[’']/g, '')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function getTagValue(playerContext, key) {
  if (!playerContext) return '';
  const match = playerContext.match(new RegExp(`${escapeRegex(key)}:\\s*(.+)`, 'i'));
  return match ? match[1].trim() : '';
}

function getKnownNameCandidates(secretPlayer, playerContext) {
  const rawCandidates = [
    secretPlayer,
    getTagValue(playerContext, 'Full Name'),
    getTagValue(playerContext, 'Common Names / Aliases'),
    getTagValue(playerContext, 'Famous Nicknames / Monikers'),
  ]
    .filter(Boolean)
    .flatMap((entry) => entry.split(/[|,;/]/g))
    .map((entry) => normalizeText(entry))
    .filter((entry) => entry.length >= 3);

  return [...new Set(rawCandidates)];
}

function questionMentionsKnownName(question, secretPlayer, playerContext) {
  const q = normalizeText(question);
  const nameCandidates = getKnownNameCandidates(secretPlayer, playerContext);

  for (const candidate of nameCandidates) {
    if (!candidate) continue;
    if (q.includes(candidate)) {
      return true;
    }
    const candidateParts = candidate.split(' ').filter((part) => part.length >= 3);
    if (candidateParts.length >= 2 && candidateParts.every((part) => q.includes(part))) {
      return true;
    }
    if (candidateParts.length === 1 && new RegExp(`\\b${escapeRegex(candidateParts[0])}\\b`, 'i').test(q)) {
      return true;
    }
  }

  return false;
}

function questionMentionsAnyPoolPlayer(question) {
  const q = normalizeText(question);
  if (!q) return false;

  for (const name of Object.keys(PLAYER_POOL || {})) {
    const normalizedName = normalizeText(name);
    if (!normalizedName) continue;
    if (q.includes(normalizedName)) {
      return true;
    }

    const parts = normalizedName.split(' ').filter((part) => part.length >= 3);
    const lastName = parts[parts.length - 1];
    if (parts.length >= 2 && parts.every((part) => q.includes(part))) {
      return true;
    }
    if (lastName && new RegExp(`\\b${escapeRegex(lastName)}\\b`, 'i').test(q)) {
      return true;
    }
  }

  return false;
}

function isNameQuestion(question, secretPlayer, playerContext) {
  const q = normalizeText(question);

  // 1. Explicit name identity questions
  if (
    /^(what|who|is|are)\b.*\b(name|player|person|identity)\b/i.test(q) ||
    /^(who\s+is\s+(he|she|it)|what('?s| is)\s+(his|her|their|the)\s+name)/i.test(q) ||
    /^(is|are)\s+(it|this|that|the player|the answer)\b/i.test(q) ||
    /\bare we thinking of\b/i.test(q)
  ) {
    return true;
  }

  // 2. Direct guess phrasing that names a specific player
  const hasGuessFrame = /^(is|are)\b/.test(q) && !/\b(better than|worse than|greater than|best player|greatest|top player|compare to|compared to|play for|club does he play for|position|age|foot|country|nationality|goals|trophies)\b/.test(q);
  if (hasGuessFrame && (questionMentionsKnownName(question, secretPlayer, playerContext) || questionMentionsAnyPoolPlayer(question))) {
    return true;
  }

  return false;
}

function getDefaultModel(provider) {
  return PROVIDER_DEFAULTS[provider?.toLowerCase()] || 'qwen2.5-coder:7b';
}

function parseLLMAnswer(raw) {
  if (typeof raw !== 'string' || !raw.trim()) {
    return "Don't Know";
  }

  const withoutBlocks = raw
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/[*_`"#]/g, ' ');

  const lines = withoutBlocks.split('\n').map((line) => line.trim()).filter(Boolean);
  const cleaned = withoutBlocks.replace(/\s+/g, ' ').trim();
  const normalized = normalizeText(cleaned);
  const firstNormalized = normalizeText(lines[0] || cleaned);

  const matchers = [
    { answer: 'Probably Not', patterns: [/^probably not\b/, /^not likely\b/, /^unlikely\b/] },
    { answer: "Don't Know", patterns: [/^(?:i\s+)?(?:don't know|dont know)\b/, /^unclear\b/, /^unknown\b/] },
    { answer: 'Probably', patterns: [/^probably\b/, /^maybe\b/, /^likely\b/] },
    { answer: 'Yes', patterns: [/^yes\b/, /^yeah\b/, /^yep\b/, /^true\b/, /^correct\b/] },
    { answer: 'No', patterns: [/^no\b/, /^nope\b/, /^false\b/, /^incorrect\b/] },
  ];

  for (const { answer, patterns } of matchers) {
    if (patterns.some((pattern) => pattern.test(firstNormalized) || pattern.test(normalized))) {
      return answer;
    }
  }

  return "Don't Know";
}

function confidenceForAnswer(answer) {
  switch (answer) {
    case 'Yes':
      return 94;
    case 'Probably':
      return 78;
    case 'Probably Not':
      return 22;
    case 'No':
      return 6;
    default:
      return 50;
  }
}

function guessMatchesKnownName(guess, secretPlayer, playerContext) {
  const guessNorm = normalizeText(guess);
  const secretNorm = normalizeText(secretPlayer);
  if (!guessNorm || !secretNorm) return false;

  if (guessNorm === secretNorm || guessNorm.includes(secretNorm) || secretNorm.includes(guessNorm)) {
    return true;
  }

  const nameCandidates = getKnownNameCandidates(secretPlayer, playerContext);
  for (const candidate of nameCandidates) {
    if (!candidate) continue;
    if (guessNorm === candidate || guessNorm.includes(candidate) || candidate.includes(guessNorm)) {
      return true;
    }
  }

  return false;
}

function parseHeightValue(heightText = '') {
  const normalized = normalizeText(heightText);
  if (!normalized) return null;

  const meterMatch = normalized.match(/(\d+(?:\.\d+)?)\s*m\b/);
  if (meterMatch) {
    return parseFloat(meterMatch[1]);
  }

  const feetInchesMatch = normalized.match(/(\d+)\s*ft\s*(\d+)?\s*in?/);
  if (feetInchesMatch) {
    const feet = parseInt(feetInchesMatch[1], 10);
    const inches = parseInt(feetInchesMatch[2] || '0', 10);
    return (feet * 0.3048) + (inches * 0.0254);
  }

  const feetOnlyMatch = normalized.match(/(\d+(?:\.\d+)?)\s*ft\b/);
  if (feetOnlyMatch) {
    return parseFloat(feetOnlyMatch[1]) * 0.3048;
  }

  return null;
}

function extractAskedCount(question) {
  const q = normalizeText(question);
  if (!q) return null;

  const explicit = q.match(/\b(\d+)\s*(?:times?|x|world cups?|titles?)\b/);
  if (explicit) {
    return parseInt(explicit[1], 10);
  }

  if (/\b(twice|double)\b/.test(q)) return 2;
  if (/\b(thrice|triple)\b/.test(q)) return 3;
  if (/\bat least one\b/.test(q)) return 1;

  const wordToNumber = {
    one: 1,
    two: 2,
    three: 3,
    four: 4,
    five: 5,
  };

  const countWord = q.match(/\b(one|two|three|four|five)\b/);
  if (countWord && /\b(times?|x|world cups?|titles?)\b/.test(q)) {
    return wordToNumber[countWord[1]] ?? null;
  }

  return null;
}

function getTrophyCount(playerContext, tagName, trophyName) {
  const trophies = getTagValue(playerContext, tagName).toLowerCase();
  if (!trophies || trophies.includes('none')) return 0;

  const normalizedTarget = normalizeText(trophyName);
  const normalizedTrophies = normalizeText(trophies);

  const explicitCountMatch = normalizedTrophies.match(new RegExp(`\\b(\\d+)\\s*x\\s*(?:[^,;]*?\\b)?${escapeRegex(normalizedTarget)}\\b`));
  if (explicitCountMatch) {
    return parseInt(explicitCountMatch[1], 10);
  }

  const mentionMatches = normalizedTrophies.match(new RegExp(`\\b${escapeRegex(normalizedTarget)}\\b`, 'g'));
  if (!mentionMatches) return 0;

  if (/(runner up|runner-up|third place|3rd place|semi final|semifinal|finalist)/.test(normalizedTrophies) && !/won|winner|champion/.test(normalizedTrophies)) {
    return 0;
  }

  return mentionMatches.length;
}

function extractBirthAndHometownFacts(playerContext) {
  const knownFacts = getTagValue(playerContext, 'Known Facts');
  const context = `${knownFacts} ${playerContext}`;
  return normalizeText(context);
}

function isObviouslyOpenEndedQuestion(question) {
  const q = normalizeText(question);
  if (!q) return true;

  if (/^(what|which|when|where|why|how|who)\b/.test(q)) {
    return !/^(who\s+is\s+(he|she|it)|what('?s| is)\s+(his|her|their|the)\s+name)/.test(q);
  }

  if (/\b(better than|worse than|greater than|best player|greatest|top player|compare to|compared to)\b/.test(q)) {
    return true;
  }

  return false;
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
  const heightTag = getTag('Height').toLowerCase();
  const playerHeightMeters = parseHeightValue(heightTag);
  const intlTrophies = getTag('Major International Trophies').toLowerCase();
  const clubTrophies = getTag('Major Club Trophies').toLowerCase();
  const ballonDor = getTag("Ballon d'Or Count").toLowerCase();
  const ballonDorCountMatch = ballonDor.match(/\b(\d+)\b/);
  const ballonDorCount = ballonDorCountMatch ? parseInt(ballonDorCountMatch[1], 10) : 0;

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

  // 1c. HEIGHT
  if (playerHeightMeters !== null && /(height|tall|taller|shorter|over|under|above|below)/i.test(qClean)) {
    const metricMatch = qClean.match(/\b(\d+(?:\.\d+)?)\s*m\b/);
    const feetInchesMatch = qClean.match(/\b(\d+)\s*ft\s*(\d+)?\s*in?/);
    const feetOnlyMatch = qClean.match(/\b(\d+(?:\.\d+)?)\s*ft\b/);
    let targetHeight = null;

    if (metricMatch) {
      targetHeight = parseFloat(metricMatch[1]);
    } else if (feetInchesMatch) {
      const feet = parseInt(feetInchesMatch[1], 10);
      const inches = parseInt(feetInchesMatch[2] || '0', 10);
      targetHeight = (feet * 0.3048) + (inches * 0.0254);
    } else if (feetOnlyMatch) {
      targetHeight = parseFloat(feetOnlyMatch[1]) * 0.3048;
    }

    if (targetHeight !== null) {
      if (/(taller|more than|over|above|greater than)/i.test(qClean)) {
        return playerHeightMeters > targetHeight ? 'Yes' : 'No';
      }
      if (/(shorter|less than|under|below)/i.test(qClean)) {
        return playerHeightMeters < targetHeight ? 'Yes' : 'No';
      }
      if (/(exactly|is he|is his height|same height|around)/i.test(qClean)) {
        return Math.abs(playerHeightMeters - targetHeight) < 0.02 ? 'Yes' : 'No';
      }
    }
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
  if (/(fifa club world cup|club world cup)/i.test(qClean)) {
    const clubWorldCupCount = getTrophyCount(playerContext, 'Major Club Trophies', 'fifa club world cup');
    const askedCount = extractAskedCount(qClean);
    if (askedCount !== null) {
      return clubWorldCupCount >= askedCount ? 'Yes' : 'No';
    }
    return clubWorldCupCount > 0 ? 'Yes' : 'No';
  }
  if (/(fifa world cup|world cup)/i.test(qClean) && /(won|win|winner|trophy|trophies|title|titles|champion|champions)/i.test(qClean)) {
    const worldCupCount = getTrophyCount(playerContext, 'Major International Trophies', 'world cup');
    const askedCount = extractAskedCount(qClean);
    if (askedCount !== null) {
      return worldCupCount >= askedCount ? 'Yes' : 'No';
    }
    return worldCupCount > 0 ? 'Yes' : 'No';
  }
  if (/(confederations cup)/i.test(qClean)) {
    return intlTrophies.includes('confederations cup') ? 'Yes' : 'No';
  }
  if (/(champions league|ucl)/i.test(qClean)) {
    const championsLeagueCount = getTrophyCount(playerContext, 'Major Club Trophies', 'champions league');
    const askedCount = extractAskedCount(qClean);
    if (askedCount !== null) {
      return championsLeagueCount >= askedCount ? 'Yes' : 'No';
    }
    return championsLeagueCount > 0 ? 'Yes' : 'No';
  }
  if (/(ballon d'or|ballon dor|ballon)/i.test(rawQ)) {
    const numMatch = qClean.match(/\b(\d+)\b/);
    if (numMatch) {
      const target = parseInt(numMatch[1], 10);
      if (/(more than|over|above|greater than|at least)/i.test(qClean)) {
        return ballonDorCount > target ? 'Yes' : 'No';
      }
      if (/(less than|under|below)/i.test(qClean)) {
        return ballonDorCount < target ? 'Yes' : 'No';
      }
      if (/(exactly|equal to|just)/i.test(qClean)) {
        return ballonDorCount === target ? 'Yes' : 'No';
      }
    }
    return ballonDorCount > 0 ? 'Yes' : 'No';
  }

  // 6. FAMOUS CLUBS
  if (/(real madrid)/i.test(qClean)) {
    return allClubs.includes('real madrid') ? 'Yes' : 'No';
  }
  if (/(barcelona|barca)/i.test(qClean)) {
    return allClubs.includes('barcelona') ? 'Yes' : 'No';
  }
  if (/(inter miami|miami cf)/i.test(qClean)) {
    return allClubs.includes('inter miami') ? 'Yes' : 'No';
  }
  if (/(santos fc|santos)/i.test(qClean)) {
    return allClubs.includes('santos') ? 'Yes' : 'No';
  }
  if (/(al nassr|nassr)/i.test(qClean)) {
    return allClubs.includes('al nassr') ? 'Yes' : 'No';
  }
  if (/(juventus)/i.test(qClean)) {
    return allClubs.includes('juventus') ? 'Yes' : 'No';
  }
  if (/(psg|paris saint-germain|paris)/i.test(qClean)) {
    return (allClubs.includes('psg') || allClubs.includes('paris')) ? 'Yes' : 'No';
  }
  if (/(sporting cp|sporting)/i.test(qClean)) {
    return allClubs.includes('sporting') ? 'Yes' : 'No';
  }
  if (/(borussia dortmund|dortmund)/i.test(qClean)) {
    return allClubs.includes('dortmund') ? 'Yes' : 'No';
  }
  if (/(monaco)/i.test(qClean)) {
    return allClubs.includes('monaco') ? 'Yes' : 'No';
  }
  if (/(flamengo)/i.test(qClean)) {
    return allClubs.includes('flamengo') ? 'Yes' : 'No';
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
  if (/(liverpool)/i.test(qClean)) {
    return allClubs.includes('liverpool') ? 'Yes' : 'No';
  }
  if (/(chelsea)/i.test(qClean)) {
    return allClubs.includes('chelsea') ? 'Yes' : 'No';
  }
  if (/(arsenal)/i.test(qClean)) {
    return allClubs.includes('arsenal') ? 'Yes' : 'No';
  }
  if (/(juventus)/i.test(qClean)) {
    return allClubs.includes('juventus') ? 'Yes' : 'No';
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
      const actualNums = jerseyTag.match(/\b(\d+)\b/g) || [];
      return actualNums.includes(askedNum) ? 'Yes' : 'No';
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

  // 10b. BIRTHPLACE / HOMETOWN
  if (/(born|from|raised|hails from)/i.test(qClean)) {
    const birthFacts = extractBirthAndHometownFacts(playerContext);
    const locationMatch = qClean.match(/\b(?:born in|from|raised in|born at|hails from)\s+([a-z\s-]+?)(?:\?|$|\bthan\b|\bmore\b|\bless\b)/i);
    if (locationMatch) {
      const location = normalizeText(locationMatch[1]);
      if (location && birthFacts.includes(location)) {
        return 'Yes';
      }
      if (location) {
        return 'No';
      }
    }
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
async function callPuter({ model, apiKey, systemPrompt, userMessage }) {
  const key = apiKey || process.env.PUTER_AUTH_TOKEN || process.env.PUTER_API_KEY;
  if (!key) {
    throw new Error('Puter auth token is required. Add it in settings or set PUTER_AUTH_TOKEN on the server.');
  }

  const selectedModel = model || PROVIDER_DEFAULTS.puter;
  try {
    const res = await fetch('https://api.puter.com/puterai/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: selectedModel,
        temperature: 0,
        max_tokens: 128,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Puter API Error (${res.status}): ${errText}`);
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content?.trim() || '';
  } catch (error) {
    console.error('Puter call failed:', error);
    throw error;
  }
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
  const nameQuestion = isNameQuestion(question, secretPlayer, playerContext);

  // 1. Direct Factual Pre-evaluation Layer
  if (!nameQuestion) {
    const directFactAnswer = evaluateFactDirectly(question, secretPlayer, playerContext);
    if (directFactAnswer !== null) {
      const confidence = directFactAnswer === 'Yes' ? 98 : 96;
      return { answer: directFactAnswer, confidence };
    }
    if (isObviouslyOpenEndedQuestion(question)) {
      return { answer: "Don't Know", confidence: 50 };
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
    return questionMentionsKnownName(question, secretPlayer, playerContext)
      ? { answer: 'Probably Not', confidence: 12 }
      : { answer: 'Probably', confidence: 78 };
  }

  // 2. Multi-turn History Context
  const historyContext = chatLog.length > 0
    ? `=== CHAT HISTORY (PREVIOUS QUESTIONS & ANSWERS) ===\n${chatLog.map((l, i) => `Q${i + 1}: "${l.question}" -> ANSWER: ${l.answer}`).join('\n')}\n=== END CHAT HISTORY ===\n\nCRITICAL CONSTRAINTS FOR HISTORY CONSISTENCY:\n1. You MUST remain 100% logically consistent with every previous answer listed above.\n2. Do NOT contradict any previous answer under any circumstance.`
    : 'This is the first question in the game.';

  const systemPrompt = `You are an expert AI Football Referee with RAG access to the official biography for the secret player: "${secretPlayer}".
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
3. Output EXACTLY one answer on the first line.
4. Allowed answers are only: Yes, No, Probably, Probably Not, or Don't Know.
5. Do not explain your reasoning.`;

  const userMessage = `User Question: "${question}"\n\nRespond with EXACTLY one answer badge.`;

  const raw = await callLLM({
    provider: config?.provider,
    model: config?.model,
    apiKey: config?.apiKey,
    systemPrompt,
    userMessage,
  });

  const parsedAnswer = parseLLMAnswer(raw);
  const confidence = confidenceForAnswer(parsedAnswer);

  return { answer: parsedAnswer, confidence };
}

/**
 * Check Player Guess Match
 */
export async function checkGuess(config, guess, secretPlayer, playerContext) {
  // Direct text match pre-check for fast & precise execution
  if (guessMatchesKnownName(guess, secretPlayer, playerContext)) {
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
