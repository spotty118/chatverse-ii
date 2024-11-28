import { Provider } from "@/types/chat";

export const getDefaultBaseUrl = (provider: Provider): string => {
  switch (provider) {
    case 'openai':
      return 'https://api.openai.com/v1';
    case 'anthropic':
      return 'https://api.anthropic.com/v1';
    case 'google':
      return 'https://generativelanguage.googleapis.com/v1beta';
    case 'mistral':
      return 'https://api.mistral.ai/v1';
    case 'ollama':
      return 'http://localhost:11434';
    case 'openrouter':
      return 'https://openrouter.ai/api/v1';
    default:
      throw new Error(`No default base URL for provider: ${provider}`);
  }
};