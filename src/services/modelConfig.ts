export type LLMProvider = 'puter' | 'ollama' | 'gemini' | 'openai' | 'anthropic' | 'groq';

export interface ModelConfig {
  provider: LLMProvider;
  model: string;
  apiKeys: {
    gemini?: string;
    openai?: string;
    anthropic?: string;
    groq?: string;
  };
}

export const PROVIDER_MODELS: Record<LLMProvider, { label: string; presets: string[]; defaultModel: string; requiresKey: boolean }> = {
  puter: {
    label: 'Puter.js (Free Cloud AI)',
    presets: ['gpt-4o-mini', 'claude-3-5-sonnet', 'deepseek-chat', 'gemini-2.0-flash', 'grok-2-1212'],
    defaultModel: 'gpt-4o-mini',
    requiresKey: false,
  },
  ollama: {
    label: 'Ollama (Local)',
    presets: ['qwen2.5-coder:7b', 'gemma4:e4b', 'gemma4:4b', 'llama3.2', 'mistral', 'gemma2', 'deepseek-r1'],
    defaultModel: 'qwen2.5-coder:7b',
    requiresKey: false,
  },
  gemini: {
    label: 'Google Gemini',
    presets: ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-1.5-flash', 'gemini-1.5-pro'],
    defaultModel: 'gemini-2.5-flash',
    requiresKey: true,
  },
  openai: {
    label: 'OpenAI',
    presets: ['gpt-4o-mini', 'gpt-4o', 'gpt-4-turbo', 'gpt-3.5-turbo'],
    defaultModel: 'gpt-4o-mini',
    requiresKey: true,
  },
  anthropic: {
    label: 'Anthropic Claude',
    presets: ['claude-3-5-haiku-20241022', 'claude-3-5-sonnet-20241022', 'claude-3-opus-20240229'],
    defaultModel: 'claude-3-5-haiku-20241022',
    requiresKey: true,
  },
  groq: {
    label: 'Groq',
    presets: ['llama-3.3-70b-versatile', 'mixtral-8x7b-32768', 'gemma2-9b-it'],
    defaultModel: 'llama-3.3-70b-versatile',
    requiresKey: true,
  },
};

const STORAGE_KEY = 'reverse_akinator_model_config';

export function getSavedModelConfig(): ModelConfig {
  const isProductionSite =
    typeof window !== 'undefined' &&
    !['localhost', '127.0.0.1'].includes(window.location.hostname);

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const provider = parsed.provider || 'ollama';
      const safeProvider = isProductionSite && provider === 'ollama' ? 'puter' : provider;
      return {
        provider: safeProvider,
        model:
          parsed.model ||
          PROVIDER_MODELS[safeProvider as LLMProvider]?.defaultModel ||
          PROVIDER_MODELS.puter.defaultModel,
        apiKeys: parsed.apiKeys || {},
      };
    }
  } catch (e) {
    console.error('Error reading saved model config', e);
  }

  return {
    provider: isProductionSite ? 'puter' : 'ollama',
    model: isProductionSite ? PROVIDER_MODELS.puter.defaultModel : 'qwen2.5-coder:7b',
    apiKeys: {},
  };
}

export function saveModelConfig(config: ModelConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Error saving model config', e);
  }
}

export function getActiveApiKey(config: ModelConfig): string | undefined {
  if (config.provider === 'ollama') return undefined;
  return config.apiKeys[config.provider as keyof typeof config.apiKeys];
}
