import { Message, Provider, ChatOptions } from "@/types/chat";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export const chatApi = {
  async sendMessage(content: string, provider: Provider, options: ChatOptions): Promise<Message> {
    console.log("Sending message to API:", { content, provider, options });
    
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content,
        provider,
        options,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to send message");
    }

    return response.json();
  },

  async getModels(provider: Provider): Promise<string[]> {
    console.log("Fetching models for provider:", provider);
    
    const response = await fetch(`${API_BASE_URL}/models/${provider}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch models");
    }

    return response.json();
  },
};