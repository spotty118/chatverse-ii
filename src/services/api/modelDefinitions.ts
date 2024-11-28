export const VALID_OPENAI_MODELS = {
  'gpt-4o': 'GPT-4o',
  'gpt-4o-mini': 'GPT-4o-mini'
};

export const VALID_GOOGLE_MODELS = {
  'gemini-1.5-pro': 'Gemini-1.5-Pro',
  'gemini-1.5-flash': 'Gemini-1.5-Flash'
};

export const VALID_OPENROUTER_MODELS = {
  'openai/gpt-4-turbo': 'GPT-4 Turbo',
  'anthropic/claude-3-opus': 'Claude 3 Opus',
  'google/gemini-pro': 'Gemini Pro',
  'meta-llama/llama-2-70b-chat': 'Llama 2 70B'
};

export const PROVIDER_MODEL_NAMES: Record<string, Record<string, string>> = {
  openai: VALID_OPENAI_MODELS,
  google: VALID_GOOGLE_MODELS,
  anthropic: {
    'claude-3-opus': 'Claude 3 Opus',
    'claude-3-sonnet': 'Claude 3 Sonnet',
    'claude-3-haiku': 'Claude 3 Haiku'
  },
  mistral: {
    'mistral-tiny': 'Mistral Tiny',
    'mistral-small': 'Mistral Small',
    'mistral-medium': 'Mistral Medium'
  },
  ollama: {
    'llama2': 'Llama 2',
    'mistral': 'Mistral',
    'codellama': 'Code Llama'
  },
  openrouter: VALID_OPENROUTER_MODELS
};