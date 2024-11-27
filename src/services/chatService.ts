import { toast } from "sonner";
import { Message, Provider, ChatOptions } from "@/types/chat";
import { configService } from "./configService";
import { v4 as uuidv4 } from "uuid";

class ChatService {
  private getApiKey(provider: Provider): string | null {
    return localStorage.getItem(`${provider}_api_key`);
  }

  private getBaseUrl(provider: Provider): string {
    const config = configService.getProviderConfigs().find(c => c.name === provider);
    return config?.baseUrl || this.getDefaultBaseUrl(provider);
  }

  private getDefaultBaseUrl(provider: Provider): string {
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
        throw new Error(`Unknown provider: ${provider}`);
    }
  }

  async sendMessage(
    content: string, 
    provider: Provider = 'openai', 
    options: ChatOptions
  ): Promise<Message> {
    console.log(`Sending message to ${provider} using model ${options.model}:`, content);
    
    const apiKey = this.getApiKey(provider);
    if (!apiKey) {
      const error = `Please set your ${provider} API key first`;
      toast.error(error);
      throw new Error(error);
    }

    try {
      let response;
      
      switch (provider) {
        case 'openai':
          response = await this.sendOpenAIMessage(content, options, apiKey);
          break;
        case 'anthropic':
          response = await this.sendAnthropicMessage(content, options, apiKey);
          break;
        case 'google':
          response = await this.sendGoogleMessage(content, options, apiKey);
          break;
        case 'mistral':
          response = await this.sendMistralMessage(content, options, apiKey);
          break;
        case 'ollama':
          response = await this.sendOllamaMessage(content, options);
          break;
        default:
          throw new Error(`Unsupported provider: ${provider}`);
      }

      return {
        id: uuidv4(),
        content: response,
        isUser: false,
        timestamp: Date.now(),
        provider,
        model: options.model
      };
    } catch (error) {
      console.error(`${provider} chat error:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Failed to get response from ${provider}: ${errorMessage}`);
      throw error;
    }
  }

  private async sendOpenAIMessage(content: string, options: ChatOptions, apiKey: string): Promise<string> {
    const baseUrl = this.getBaseUrl('openai');
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: options.model,
        messages: [{ role: "user", content }],
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens,
        stream: false
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "Failed to get response from OpenAI");
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  private async sendAnthropicMessage(content: string, options: ChatOptions, apiKey: string): Promise<string> {
    const baseUrl = this.getBaseUrl('anthropic');
    const response = await fetch(`${baseUrl}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: options.model,
        messages: [{ role: "user", content }],
        max_tokens: options.maxTokens || 1024,
        temperature: options.temperature
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "Failed to get response from Anthropic");
    }

    const data = await response.json();
    return data.content[0].text;
  }

  private async sendGoogleMessage(content: string, options: ChatOptions, apiKey: string): Promise<string> {
    const baseUrl = this.getBaseUrl('google');
    const response = await fetch(`${baseUrl}/models/${options.model}:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: content }] }],
        generationConfig: {
          temperature: options.temperature,
          maxOutputTokens: options.maxTokens
        }
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "Failed to get response from Google AI");
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  }

  private async sendMistralMessage(content: string, options: ChatOptions, apiKey: string): Promise<string> {
    const baseUrl = this.getBaseUrl('mistral');
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: options.model,
        messages: [{ role: "user", content }],
        temperature: options.temperature,
        max_tokens: options.maxTokens
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "Failed to get response from Mistral");
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  private async sendOllamaMessage(content: string, options: ChatOptions): Promise<string> {
    const baseUrl = this.getBaseUrl('ollama');
    const response = await fetch(`${baseUrl}/api/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: options.model,
        prompt: content,
        stream: false,
        options: {
          temperature: options.temperature,
          num_predict: options.maxTokens
        }
      })
    });

    if (!response.ok) {
      throw new Error("Failed to get response from Ollama");
    }

    const data = await response.json();
    return data.response;
  }

  setApiKey(provider: Provider, key: string) {
    localStorage.setItem(`${provider}_api_key`, key);
    const config = configService.getProviderConfigs().find(c => c.name === provider);
    if (config) {
      configService.setProviderConfig({ ...config, isEnabled: true });
    }
    toast.success(`${provider} API key has been saved`);
  }
}

export const chatService = new ChatService();