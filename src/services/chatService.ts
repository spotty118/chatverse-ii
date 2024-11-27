import { toast } from "sonner";

export interface ChatResponse {
  content: string;
  isUser: boolean;
}

const API_ENDPOINT = "https://api.openai.com/v1/chat/completions";

export class ChatService {
  private apiKey: string | null = null;

  setApiKey(key: string) {
    this.apiKey = key;
    localStorage.setItem("openai_api_key", key);
  }

  getApiKey(): string | null {
    if (!this.apiKey) {
      this.apiKey = localStorage.getItem("openai_api_key");
    }
    return this.apiKey;
  }

  async sendMessage(message: string, model: string = "gpt-4o"): Promise<ChatResponse> {
    console.log("Sending message:", message, "with model:", model);
    
    if (!this.getApiKey()) {
      toast.error("Please set your OpenAI API key first");
      throw new Error("API key not set");
    }

    try {
      const response = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: model,
          messages: [{ role: "user", content: message }],
          temperature: 0.7
        })
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("API Error:", error);
        throw new Error(error.error?.message || "Failed to get response");
      }

      const data = await response.json();
      console.log("API Response:", data);

      return {
        content: data.choices[0].message.content,
        isUser: false
      };
    } catch (error) {
      console.error("Chat error:", error);
      toast.error("Failed to get response from AI");
      throw error;
    }
  }
}

export const chatService = new ChatService();