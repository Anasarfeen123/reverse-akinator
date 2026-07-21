import { GoogleGenAI } from '@google/genai';
import type { AllowedAnswer, ChatLogEntry } from '../types/game';

// Standard fallback if API key is not present. This ensures the app still works for local testing
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
let aiClient: GoogleGenAI | null = null;
if (apiKey) {
  aiClient = new GoogleGenAI({ apiKey });
}

const DEFAULT_MODEL = 'gemini-2.5-flash';

const normalizeText = (value = '') =>
  value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[’']/g, '')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const parseAllowedAnswer = (raw: string): AllowedAnswer => {
  if (!raw?.trim()) return "Don't Know";

  const withoutBlocks = raw
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/[*_`"#]/g, ' ');
  const lines = withoutBlocks.split('\n').map((line) => line.trim()).filter(Boolean);
  const first = normalizeText(lines[0] || withoutBlocks);
  const normalized = normalizeText(withoutBlocks.replace(/\s+/g, ' ').trim());

  const matchers: Array<{ answer: AllowedAnswer; patterns: RegExp[] }> = [
    { answer: 'Probably Not', patterns: [/^probably not\b/, /^not likely\b/, /^unlikely\b/] },
    { answer: "Don't Know", patterns: [/^(?:i\s+)?(?:dont know|don't know)\b/, /^unknown\b/, /^unclear\b/] },
    { answer: 'Probably', patterns: [/^probably\b/, /^maybe\b/, /^likely\b/] },
    { answer: 'Yes', patterns: [/^yes\b/, /^yeah\b/, /^yep\b/, /^true\b/, /^correct\b/] },
    { answer: 'No', patterns: [/^no\b/, /^nope\b/, /^false\b/, /^incorrect\b/] },
  ];

  for (const { answer, patterns } of matchers) {
    if (patterns.some((pattern) => pattern.test(first) || pattern.test(normalized))) {
      return answer;
    }
  }

  return "Don't Know";
};

export const aiReferee = {
  /**
   * Instructs the AI to secretly pick a football player.
   */
  pickSecretPlayer: async (): Promise<string> => {
    if (!aiClient) {
      // Mock for development if no key is provided
      return new Promise(resolve => setTimeout(() => resolve('Erling Haaland'), 1500));
    }

    const prompt = `You are playing a game of Reverse Akinator. 
Your task is to secretly pick a well-known professional football (soccer) player.
You can pick any player from history or currently playing, as long as they are highly recognizable.
Return ONLY the full name of the player. Do not include any other text.`;

    try {
      const response = await aiClient.models.generateContent({
        model: DEFAULT_MODEL,
        contents: prompt,
      });
      return response.text?.trim() || 'Lionel Messi'; // fallback
    } catch (error) {
      console.error("AI Error picking player:", error);
      throw error;
    }
  },

  /**
   * Instructs the AI to answer a yes/no question about the secret player.
   */
  answerQuestion: async (
    question: string,
    secretPlayer: string,
    chatLog: ChatLogEntry[]
  ): Promise<AllowedAnswer> => {
    if (!aiClient) {
      return new Promise(resolve => setTimeout(() => resolve("Don't Know"), 1500));
    }

    const chatHistoryContext = chatLog.length > 0 
      ? `Here is the history of questions already asked and answered:\n${chatLog.map((log, i) => `Q${i + 1}: ${log.question} -> A: ${log.answer}`).join('\n')}\n\nYou must remain consistent with these previous answers.`
      : 'This is the first question.';

    const prompt = `You are the AI in a game of Reverse Akinator. You have secretly chosen the football player: ${secretPlayer}.
The human is trying to guess who it is by asking questions.

${chatHistoryContext}

The human's new question is: "${question}"

RULES:
1. You must answer the question based on the fact that your secret player is ${secretPlayer}.
      2. You MUST ONLY respond with exactly one of these five options: "Yes", "No", "Probably", "Probably Not", "Don't Know".
      3. If the question is not a yes/no question (e.g. "What club does he play for?"), respond with "Don't Know".
      4. If the question is nonsense, respond with "Don't Know".
      5. Put the answer on the first line and do not include any explanation.`;

    try {
      const response = await aiClient.models.generateContent({
        model: DEFAULT_MODEL,
        contents: prompt,
      });
      return parseAllowedAnswer(response.text || '');
    } catch (error) {
      console.error("AI Error answering question:", error);
      throw error;
    }
  },

  /**
   * Checks if the human's guess is correct using AI for fuzzy matching.
   */
  checkGuess: async (guess: string, secretPlayer: string): Promise<boolean> => {
    if (!aiClient) {
      return new Promise(resolve => setTimeout(() => {
        const guessNorm = normalizeText(guess);
        const secretNorm = normalizeText(secretPlayer);
        resolve(Boolean(guessNorm && secretNorm && (guessNorm === secretNorm || guessNorm.includes(secretNorm) || secretNorm.includes(guessNorm))));
      }, 1000));
    }

    const prompt = `The human guessed the player is "${guess}".
The actual secret player is "${secretPlayer}".
Are they the same person? Be lenient with spelling mistakes (e.g. "Halland" = "Erling Haaland" is correct, "Ronaldinho" = "Ronaldo de Assis Moreira" is correct).
Return ONLY the word "YES" if it is a correct match, or "NO" if it is incorrect.`;

    try {
      const response = await aiClient.models.generateContent({
        model: DEFAULT_MODEL,
        contents: prompt,
      });
      return normalizeText(response.text || '').startsWith('yes');
    } catch (error) {
      console.error("AI Error checking guess:", error);
      throw error;
    }
  }
};
