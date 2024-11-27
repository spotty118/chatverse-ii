import { Message, Provider, ChatOptions } from "@/types/chat";
import { handleOpenAIChat, streamOpenAIChat } from "../providers/openaiService";
import { handleAnthropicChat, streamAnthropicChat } from "../providers/anthropicService";
import { handleGoogleChat, streamGoogleChat } from "../providers/googleService";
import { handleMistralChat } from "../providers/mistralService";
import { handleOllamaChat } from "../providers/ollamaService";

// Define valid OpenAI models with display names
const VALID_OPENAI_MODELS = {
  'gpt-4o': 'GPT-4o',
  'gpt-4o-mini': 'GPT-4o-mini'
};

// Define valid Google models with display names
const VALID_GOOGLE_MODELS = {
  'gemini-1.5-pro': 'Gemini-1.5-Pro',
  'gemini-1.5-flash': 'Gemini-1.5-Flash'
};

export const chatApi = {
  getModelDisplayName(provider: Provider, modelId: string): string {
    switch (provider) {
      case 'openai':
        return VALID_OPENAI_MODELS[modelId as keyof typeof VALID_OPENAI_MODELS] || modelId;
      case 'google':
        return VALID_GOOGLE_MODELS[modelId as keyof typeof VALID_GOOGLE_MODELS] || modelId;
      case 'anthropic':
        const anthropicDisplayNames: Record<string, string> = {
          'claude-3-opus': 'Claude 3 Opus',
          'claude-3-sonnet': 'Claude 3 Sonnet',
          'claude-3-haiku': 'Claude 3 Haiku'
        };
        return anthropicDisplayNames[modelId] || modelId;
      case 'mistral':
        const mistralDisplayNames: Record<string, string> = {
          'mistral-tiny': 'Mistral Tiny',
          'mistral-small': 'Mistral Small',
          'mistral-medium': 'Mistral Medium'
        };
        return mistralDisplayNames[modelId] || modelId;
      case 'ollama':
        const ollamaDisplayNames: Record<string, string> = {
          'llama2': 'Llama 2',
          'mistral': 'Mistral',
          'codellama': 'Code Llama'
        };
        return ollamaDisplayNames[modelId] || modelId;
      default:
        return modelId;
    }
  },

  async sendMessage(content: string, provider: Provider, options: ChatOptions & { baseUrl?: string }): Promise<Message> {
    console.log("Sending API message:", { content, provider, options });
    
    const apiKey = localStorage.getItem(`${provider}_api_key`);
    if (!apiKey) {
      throw new Error(`No API key found for ${provider}`);
    }

    try {
      let response: string;
      const baseUrl = options.baseUrl || this.getDefaultBaseUrl(provider);
      console.log(`Using base URL: ${baseUrl}`);

      switch (provider) {
        case 'openai':
          response = options.stream 
            ? await streamOpenAIChat(content, options, apiKey, baseUrl)
            : await handleOpenAIChat(content, options, apiKey, baseUrl);
          break;

        case 'anthropic':
          response = options.stream
            ? await streamAnthropicChat(content, options, apiKey, baseUrl)
            : await handleAnthropicChat(content, options, apiKey, baseUrl);
          break;

        case 'google':
          response = options.stream
            ? await streamGoogleChat(content, options, apiKey, baseUrl)
            : await handleGoogleChat(content, options, apiKey, baseUrl);
          break;

        case 'mistral':
          response = await handleMistralChat(content, options, apiKey, baseUrl);
          break;

        case 'ollama':
          response = await handleOllamaChat(content, options, baseUrl);
          break;

        default:
          throw new Error(`Unsupported provider: ${provider}`);
      }

      return {
        id: crypto.randomUUID(),
        content: response,
        isUser: false,
        timestamp: Date.now(),
        provider,
        model: options.model
      };
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  },

  getDefaultBaseUrl(provider: Provider): string {
    switch (provider) {
      case 'openai':
        return 'https://api.openai.com/v1';
      case 'anthropic':
        return 'https://api.anthropic.com/v1';
      case 'google':
        return 'https://generativelanguage.googleapis.com/v1';
      case 'mistral':
        return 'https://api.mistral.ai/v1';
      case 'ollama':
        return 'http://localhost:11434';
      default:
        throw new Error(`No default base URL for provider: ${provider}`);
    }
  },

  async getModels(provider: Provider): Promise<string[]> {
    console.log("Fetching models for provider:", provider);
    
    const apiKey = localStorage.getItem(`${provider}_api_key`);
    if (!apiKey) {
      console.log("No API key found, returning empty model list");
      return [];
    }

    try {
      let modelIds: string[] = [];
      
      switch (provider) {
        case 'openai':
          modelIds = Object.keys(VALID_OPENAI_MODELS);
          break;

        case 'anthropic':
          modelIds = ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'];
          break;

        case 'google':
          modelIds = Object.keys(VALID_GOOGLE_MODELS);
          break;

        case 'mistral':
          const mistralResponse = await fetch("https://api.mistral.ai/v1/models", {
            headers: {
              "Authorization": `Bearer ${apiKey}`
            }
          });
          if (mistralResponse.ok) {
            const data = await mistralResponse.json();
            modelIds = data.data.map((model: any) => model.id);
          }
          break;

        case 'ollama':
          const ollamaResponse = await fetch("http://localhost:11434/api/tags");
          if (ollamaResponse.ok) {
            const data = await ollamaResponse.json();
            modelIds = data.models || [];
          }
          break;
      }

      console.log(`Fetched models for ${provider}:`, modelIds);
      return modelIds;
    } catch (error) {
      console.error("Error fetching models:", error);
      return [];
    }
  }
};
