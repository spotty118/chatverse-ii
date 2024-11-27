import { Message, Provider, ChatOptions } from "@/types/chat";

const API_BASE_URL = import.meta.env.VITE_API_URL;

// Default models when API is not available
const DEFAULT_MODELS: Record<Provider, string[]> = {
  openai: ['gpt-4o', 'gpt-4o-mini', 'GPT-3.5'],
  anthropic: ['Claude 3.5 Sonnet', 'Claude 3.5 Haiku', 'Claude 3 Opus'],
  google: ['o1-mini'],
  mistral: [],
  ollama: []
};

export const chatApi = {
  async sendMessage(content: string, provider: Provider, options: ChatOptions): Promise<Message> {
    console.log("Sending message to API:", { content, provider, options });
    
    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          content,
          provider,
          options,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "Network response was not ok" }));
        throw new Error(error.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Received response:", data);
      return data;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  },

  async getModels(provider: Provider): Promise<string[]> {
    console.log("Fetching models for provider:", provider);
    
    try {
      // First try to fetch from API
      const response = await fetch(`${API_BASE_URL}/models/${provider}`, {
        headers: {
          "Accept": "application/json",
        },
      });
      
      if (!response.ok) {
        console.log("API not available, using default models");
        return DEFAULT_MODELS[provider] || [];
      }

      const data = await response.json();
      console.log("Received models:", data);
      return data;
    } catch (error) {
      console.log("API Error, falling back to default models:", error);
      return DEFAULT_MODELS[provider] || [];
    }
  },
};