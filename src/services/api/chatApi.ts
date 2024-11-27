import { Message, Provider, ChatOptions } from "@/types/chat";

const API_BASE_URL = import.meta.env.VITE_API_URL;

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

      return response.json();
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  },

  async getModels(provider: Provider): Promise<string[]> {
    console.log("Fetching models for provider:", provider);
    
    try {
      const response = await fetch(`${API_BASE_URL}/models/${provider}`, {
        headers: {
          "Accept": "application/json",
        },
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "Network response was not ok" }));
        throw new Error(error.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Received models:", data);
      return data;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  },
};