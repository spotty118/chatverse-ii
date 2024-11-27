import { Message, Provider, ChatOptions } from "@/types/chat";
import { handleOpenAIChat, streamOpenAIChat } from "../providers/openaiService";
import { handleAnthropicChat, streamAnthropicChat } from "../providers/anthropicService";
import { handleGoogleChat, streamGoogleChat } from "../providers/googleService";
import { handleMistralChat } from "../providers/mistralService";
import { handleOllamaChat } from "../providers/ollamaService";

const API_BASE_URL = import.meta.env.VITE_API_URL;

// Define valid OpenAI models - only include definitely available models
const VALID_OPENAI_MODELS = [
  'gpt-4o',           // High-intelligence flagship model
  'gpt-4o-mini'       // Affordable small model
];

// Define valid Google models
const VALID_GOOGLE_MODELS = [
  'gemini-pro-1.5',     // Latest Gemini Pro
  'gemini-flash-1.5'    // Latest Gemini Flash
];

export const chatApi = {
  async sendMessage(content: string, provider: Provider, options: ChatOptions): Promise<Message> {
    console.log("Sending message to API:", { content, provider, options });
    
    const apiKey = localStorage.getItem(`${provider}_api_key`);
    if (!apiKey) {
      throw new Error(`No API key found for ${provider}`);
    }

    try {
      let response: string;

      switch (provider) {
        case 'openai':
          if (!VALID_OPENAI_MODELS.includes(options.model)) {
            throw new Error(`Unsupported OpenAI model. Please use one of: ${VALID_OPENAI_MODELS.join(', ')}`);
          }
          response = options.stream 
            ? await streamOpenAIChat(content, options, apiKey, "https://api.openai.com/v1")
            : await handleOpenAIChat(content, options, apiKey, "https://api.openai.com/v1");
          break;

        case 'anthropic':
          response = options.stream
            ? await streamAnthropicChat(content, options, apiKey, "https://api.anthropic.com/v1")
            : await handleAnthropicChat(content, options, apiKey, "https://api.anthropic.com/v1");
          break;

        case 'google':
          if (!VALID_GOOGLE_MODELS.includes(options.model)) {
            throw new Error(`Unsupported Google model. Please use one of: ${VALID_GOOGLE_MODELS.join(', ')}`);
          }
          response = options.stream
            ? await streamGoogleChat(content, options, apiKey, "https://generativelanguage.googleapis.com/v1")
            : await handleGoogleChat(content, options, apiKey, "https://generativelanguage.googleapis.com/v1");
          break;

        case 'mistral':
          response = await handleMistralChat(content, options, apiKey, "https://api.mistral.ai/v1");
          break;

        case 'ollama':
          response = await handleOllamaChat(content, options, "http://localhost:11434");
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

  async getModels(provider: Provider): Promise<string[]> {
    console.log("Fetching models for provider:", provider);
    
    const apiKey = localStorage.getItem(`${provider}_api_key`);
    if (!apiKey) {
      console.log("No API key found, returning empty model list");
      return [];
    }

    try {
      let models: string[] = [];
      
      switch (provider) {
        case 'openai':
          // Return only the supported models
          models = VALID_OPENAI_MODELS;
          break;

        case 'anthropic':
          // Anthropic doesn't have a models endpoint, return supported models
          models = ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'];
          break;

        case 'google':
          // Return only the supported Google models
          models = VALID_GOOGLE_MODELS;
          break;

        case 'mistral':
          const mistralResponse = await fetch("https://api.mistral.ai/v1/models", {
            headers: {
              "Authorization": `Bearer ${apiKey}`
            }
          });
          if (mistralResponse.ok) {
            const data = await mistralResponse.json();
            models = data.data.map((model: any) => model.id);
          }
          break;

        case 'ollama':
          const ollamaResponse = await fetch("http://localhost:11434/api/tags");
          if (ollamaResponse.ok) {
            const data = await ollamaResponse.json();
            models = data.models || [];
          }
          break;
      }

      console.log(`Fetched models for ${provider}:`, models);
      return models;
    } catch (error) {
      console.error("Error fetching models:", error);
      return [];
    }
  }
};