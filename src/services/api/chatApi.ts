import { Message, Provider, ChatOptions } from "@/types/chat";
import { handleOpenAIChat, streamOpenAIChat } from "../providers/openaiService";
import { handleAnthropicChat, streamAnthropicChat } from "../providers/anthropicService";
import { handleGoogleChat, streamGoogleChat } from "../providers/googleService";
import { handleMistralChat } from "../providers/mistralService";
import { handleOllamaChat } from "../providers/ollamaService";
import { handleOpenRouterChat } from "../providers/openrouterService";
import { PROVIDER_MODEL_NAMES } from "./modelDefinitions";
import { getDefaultBaseUrl } from "./baseUrls";

export const chatApi = {
  getModelDisplayName(provider: Provider, modelId: string): string {
    const providerModels = PROVIDER_MODEL_NAMES[provider] || {};
    return providerModels[modelId] || modelId;
  },

  async sendMessage(content: string, provider: Provider, options: ChatOptions & { baseUrl?: string }): Promise<Message> {
    console.log("Sending API message:", { content, provider, options });
    
    const apiKey = localStorage.getItem(`${provider}_api_key`);
    if (!apiKey) {
      throw new Error(`No API key found for ${provider}`);
    }

    try {
      let response: string;
      // For Google, always use Cloudflare URL if available
      const baseUrl = provider === 'google' 
        ? localStorage.getItem('cloudflare_url_google') || getDefaultBaseUrl(provider)
        : options.baseUrl || getDefaultBaseUrl(provider);
      
      const useCloudflare = localStorage.getItem('use_cloudflare') === 'true';
      console.log(`Using base URL: ${baseUrl}, Cloudflare enabled: ${useCloudflare}`);

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
          console.log('Using Google API through Cloudflare');
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

        case 'openrouter':
          response = await handleOpenRouterChat(content, options, apiKey, baseUrl);
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
      let modelIds: string[] = [];
      
      switch (provider) {
        case 'openai':
          modelIds = Object.keys(PROVIDER_MODEL_NAMES.openai);
          break;

        case 'anthropic':
          modelIds = Object.keys(PROVIDER_MODEL_NAMES.anthropic);
          break;

        case 'google':
          modelIds = Object.keys(PROVIDER_MODEL_NAMES.google);
          break;

        case 'mistral':
          const mistralResponse = await fetch("https://api.mistral.ai/v1/models", {
            headers: { "Authorization": `Bearer ${apiKey}` }
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

        case 'openrouter':
          const openrouterResponse = await fetch("https://openrouter.ai/api/v1/models", {
            headers: { "Authorization": `Bearer ${apiKey}` }
          });
          if (openrouterResponse.ok) {
            const data = await openrouterResponse.json();
            modelIds = data.data.map((model: any) => model.id);
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