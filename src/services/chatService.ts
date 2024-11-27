import { toast } from "sonner";
import { Message, Provider, ChatOptions, ChatState } from "@/types/chat";
import { configService } from "./configService";
import { v4 as uuidv4 } from "uuid";

// Import provider-specific handlers
import { handleOpenAIChat, streamOpenAIChat } from "./providers/openaiService";
import { handleAnthropicChat, streamAnthropicChat } from "./providers/anthropicService";
import { handleGoogleChat, streamGoogleChat } from "./providers/googleService";
import { handleMistralChat } from "./providers/mistralService";
import { handleOllamaChat } from "./providers/ollamaService";

class ChatService {
  private state: ChatState = {
    messages: [],
    context: "",
    streaming: false
  };

  private subscribers: ((state: ChatState) => void)[] = [];

  constructor() {
    // Load persisted messages from localStorage
    const savedMessages = localStorage.getItem('chat_messages');
    if (savedMessages) {
      this.state.messages = JSON.parse(savedMessages);
    }
  }

  subscribe(callback: (state: ChatState) => void) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  private updateState(newState: Partial<ChatState>) {
    this.state = { ...this.state, ...newState };
    this.subscribers.forEach(callback => callback(this.state));
    
    // Persist messages to localStorage
    localStorage.setItem('chat_messages', JSON.stringify(this.state.messages));
  }

  private getApiKey(provider: Provider): string | null {
    return localStorage.getItem(`${provider}_api_key`);
  }

  private getBaseUrl(provider: Provider): string {
    const config = configService.getProviderConfigs().find(c => c.name === provider);
    if (config?.baseUrl) {
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
      // Create and add user message
      const userMessage: Message = {
        id: uuidv4(),
        content,
        isUser: true,
        timestamp: Date.now(),
        provider,
        model: options.model
      };
      
      this.updateState({
        messages: [...this.state.messages, userMessage]
      });

      // Handle streaming if supported and requested
      if (options.stream && this.supportsStreaming(provider)) {
        return this.handleStreamingResponse(provider, content, options, apiKey);
      }

      // Handle regular response
      const response = await this.handleRegularResponse(provider, content, options, apiKey);
      return response;

    } catch (error) {
      console.error(`${provider} chat error:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Failed to get response from ${provider}: ${errorMessage}`);
      throw error;
    }
  }

  private supportsStreaming(provider: Provider): boolean {
    const config = configService.getProviderConfigs().find(c => c.name === provider);
    return config?.streamingSupported ?? false;
  }

  private async handleStreamingResponse(
    provider: Provider,
    content: string,
    options: ChatOptions,
    apiKey: string
  ): Promise<Message> {
    const baseUrl = this.getBaseUrl(provider);
    const pendingMessage: Message = {
      id: uuidv4(),
      content: "",
      isUser: false,
      timestamp: Date.now(),
      provider,
      model: options.model,
      pending: true
    };

    this.updateState({
      messages: [...this.state.messages, pendingMessage],
      streaming: true
    });

    try {
      const streamHandler = (chunk: string) => {
        pendingMessage.content += chunk;
        pendingMessage.pending = true;
        this.updateState({ messages: [...this.state.messages] });
      };

      let finalContent = "";
      switch (provider) {
        case 'openai':
          finalContent = await streamOpenAIChat(content, options, apiKey, baseUrl, streamHandler);
          break;
        case 'anthropic':
          finalContent = await streamAnthropicChat(content, options, apiKey, baseUrl, streamHandler);
          break;
        case 'google':
          finalContent = await streamGoogleChat(content, options, apiKey, baseUrl, streamHandler);
          break;
        default:
          throw new Error(`Streaming not supported for provider: ${provider}`);
      }

      const finalMessage: Message = {
        ...pendingMessage,
        content: finalContent,
        pending: false
      };

      this.updateState({
        messages: this.state.messages.map(m => 
          m.id === pendingMessage.id ? finalMessage : m
        ),
        streaming: false
      });

      return finalMessage;
    } catch (error) {
      this.updateState({
        messages: this.state.messages.filter(m => m.id !== pendingMessage.id),
        streaming: false
      });
      throw error;
    }
  }

  private async handleRegularResponse(
    provider: Provider,
    content: string,
    options: ChatOptions,
    apiKey: string
  ): Promise<Message> {
    const baseUrl = this.getBaseUrl(provider);
    let response: string;

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

    const message: Message = {
      id: uuidv4(),
      content: response,
      isUser: false,
      timestamp: Date.now(),
      provider,
      model: options.model
    };

    this.updateState({
      messages: [...this.state.messages, message]
    });

    return message;
  }

  setApiKey(provider: Provider, key: string) {
    localStorage.setItem(`${provider}_api_key`, key);
    const config = configService.getProviderConfigs().find(c => c.name === provider);
    if (config) {
      configService.setProviderConfig({ ...config, isEnabled: true });
    }
    toast.success(`${provider} API key has been saved`);
  }

  clearMessages() {
    this.updateState({ messages: [] });
    localStorage.removeItem('chat_messages');
    toast.success("Chat history cleared");
  }

  getMessages(): Message[] {
    return this.state.messages;
  }
}

export const chatService = new ChatService();