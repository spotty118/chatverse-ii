import { toast } from "sonner";
import { Message, Provider } from "@/types/chat";
import { configService } from "./configService";
import { v4 as uuidv4 } from "uuid";

class ChatService {
  private getApiKey(provider: Provider): string | null {
    return localStorage.getItem(`${provider}_api_key`);
  }

  setApiKey(provider: Provider, key: string) {
    localStorage.setItem(`${provider}_api_key`, key);
    const config = configService.getProviderConfigs().find(c => c.name === provider);
    if (config) {
      configService.setProviderConfig({ ...config, isEnabled: true });
    }
  }

  async sendMessage(content: string, provider: Provider = 'openai', model: string = 'gpt-4o'): Promise<Message> {
    console.log(`Sending message to ${provider} using model ${model}:`, content);
    
    const apiKey = this.getApiKey(provider);
    if (!apiKey) {
      toast.error(`Please set your ${provider} API key first`);
      throw new Error("API key not set");
    }

    try {
      let response;
      
      switch (provider) {
        case 'openai':
          response = await this.sendOpenAIMessage(content, model, apiKey);
          break;
        case 'anthropic':
          response = await this.sendAnthropicMessage(content, model, apiKey);
          break;
        case 'google':
          response = await this.sendGoogleMessage(content, model, apiKey);
          break;
        case 'mistral':
          response = await this.sendMistralMessage(content, model, apiKey);
          break;
        case 'ollama':
          response = await this.sendOllamaMessage(content, model, apiKey);
          break;
        default:
          throw new Error(`Unsupported provider: ${provider}`);
      }

      return {
        id: uuidv4(),
        content: response,
        isUser: false,
        timestamp: Date.now(),
        provider
      };
    } catch (error) {
      console.error(`${provider} chat error:`, error);
      toast.error(`Failed to get response from ${provider}`);
      throw error;
    }
  }

  private async sendOpenAIMessage(content: string, model: string, apiKey: string): Promise<string> {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content }],
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "Failed to get response");
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  private async sendAnthropicMessage(content: string, model: string, apiKey: string): Promise<string> {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content }],
        max_tokens: 1024
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "Failed to get response");
    }

    const data = await response.json();
    return data.content[0].text;
  }

  private async sendGoogleMessage(content: string, model: string, apiKey: string): Promise<string> {
    // Implementation will be added when Google AI API is available
    return "Google AI integration coming soon";
  }

  private async sendMistralMessage(content: string, model: string, apiKey: string): Promise<string> {
    const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content }],
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "Failed to get response");
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  private async sendOllamaMessage(content: string, model: string, apiKey: string): Promise<string> {
    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        prompt: content,
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error("Failed to get response from Ollama");
    }

    const data = await response.json();
    return data.response;
  }
}

export const chatService = new ChatService();