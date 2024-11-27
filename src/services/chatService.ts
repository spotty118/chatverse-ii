import { toast } from "sonner";
import { Message, Provider, ChatOptions } from "@/types/chat";
import { configService } from "./configService";
import { v4 as uuidv4 } from "uuid";

// Split into smaller files for better organization
import { handleOpenAIChat } from "./providers/openaiService";
import { handleAnthropicChat } from "./providers/anthropicService";
import { handleGoogleChat } from "./providers/googleService";
import { handleMistralChat } from "./providers/mistralService";
import { handleOllamaChat } from "./providers/ollamaService";

class ChatService {
  private getApiKey(provider: Provider): string | null {
    return localStorage.getItem(`${provider}_api_key`);
  }

  private getBaseUrl(provider: Provider): string {
    const config = configService.getProviderConfigs().find(c => c.name === provider);
    if (config?.baseUrl) {
      // Ensure URL doesn't end with a colon
      return config.baseUrl.replace(/:$/, '');
    }
    return this.getDefaultBaseUrl(provider);
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
      const baseUrl = this.getBaseUrl(provider);
      console.log(`Using base URL for ${provider}:`, baseUrl);
      
      switch (provider) {
        case 'openai':
          response = await handleOpenAIChat(content, options, apiKey, baseUrl);
          break;
        case 'anthropic':
          response = await handleAnthropicChat(content, options, apiKey, baseUrl);
          break;
        case 'google':
          response = await handleGoogleChat(content, options, apiKey, baseUrl);
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