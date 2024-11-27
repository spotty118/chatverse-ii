import { Message, Provider, ChatOptions } from "@/types/chat";
import { handleOpenAIChat, streamOpenAIChat } from "../providers/openaiService";
import { handleAnthropicChat, streamAnthropicChat } from "../providers/anthropicService";
import { handleGoogleChat, streamGoogleChat } from "../providers/googleService";
import { handleMistralChat } from "../providers/mistralService";
import { handleOllamaChat } from "../providers/ollamaService";

const API_BASE_URL = import.meta.env.VITE_API_URL;

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
      console.log("No API key found, returning default models");
      return this.getDefaultModels(provider);
    }

    try {
      let response: Response;
      
      switch (provider) {
        case 'openai':
          response = await fetch("https://api.openai.com/v1/models", {
            headers: {
              "Authorization": `Bearer ${apiKey}`
            }
          });
          break;

        case 'anthropic':
          return ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'];

        case 'google':
          // Only officially supported Google Gemini models
          return [
            'gemini-pro',
            'gemini-pro-vision'
          ];

        case 'mistral':
          response = await fetch("https://api.mistral.ai/v1/models", {
            headers: {
              "Authorization": `Bearer ${apiKey}`
            }
          });
          break;

        case 'ollama':
          response = await fetch("http://localhost:11434/api/tags");
          break;

        default:
          throw new Error(`Unsupported provider: ${provider}`);
      }

      if (!response.ok) {
        console.log("API not available, using default models");
        return this.getDefaultModels(provider);
      }

      const data = await response.json();
      
      // Format response based on provider
      switch (provider) {
        case 'openai':
          return data.data
            .filter((model: any) => model.id.startsWith('gpt'))
            .map((model: any) => model.id);
        
        case 'mistral':
          return data.data.map((model: any) => model.id);
        
        case 'ollama':
          return data.models || [];
        
        default:
          return this.getDefaultModels(provider);
      }
    } catch (error) {
      console.log("Error fetching models:", error);
      return this.getDefaultModels(provider);
    }
  },

  getDefaultModels(provider: Provider): string[] {
    switch (provider) {
      case 'openai':
        return ['gpt-4o', 'gpt-4o-mini', 'gpt-3.5'];
      case 'anthropic':
        return ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'];
      case 'google':
        return [
          'gemini-pro',
          'gemini-pro-vision'
        ];
      case 'mistral':
        return ['mistral-tiny', 'mistral-small', 'mistral-medium'];
      case 'ollama':
        return ['llama2', 'mistral', 'codellama'];
      default:
        return [];
    }
  }
};