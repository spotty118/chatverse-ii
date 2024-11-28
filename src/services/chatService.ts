import { toast } from "sonner";
import { Message, Provider, ChatOptions, ChatState } from "@/types/chat";
import { configService } from "./configService";
import { chatApi } from "./api/chatApi";
import { v4 as uuidv4 } from "uuid";

class ChatService {
  private state: ChatState = {
    messages: [],
    context: "",
    streaming: false
  };
  private providerBaseUrls: Record<Provider, string> = {
    openai: '',
    anthropic: '',
    google: '',
    mistral: '',
    ollama: '',
    openrouter: ''
  };
  private subscribers: ((state: ChatState) => void)[] = [];
  private abortController: AbortController | null = null;

  constructor() {
    console.log("ChatService initialized");
    const useCloudflare = localStorage.getItem('use_cloudflare') === 'true';
    if (useCloudflare) {
      this.providerBaseUrls = {
        openai: localStorage.getItem('cloudflare_url_openai') || '',
        anthropic: localStorage.getItem('cloudflare_url_anthropic') || '',
        google: localStorage.getItem('cloudflare_url_google') || '',
        mistral: localStorage.getItem('cloudflare_url_mistral') || '',
        ollama: localStorage.getItem('cloudflare_url_ollama') || '',
        openrouter: localStorage.getItem('cloudflare_url_openrouter') || ''
      };
    }
  }

  setProviderBaseUrls(urls: Partial<Record<Provider, string>>) {
    console.log("Setting provider base URLs:", urls);
    this.providerBaseUrls = { ...this.providerBaseUrls, ...urls };
  }

  getBaseUrl(provider: Provider): string {
    return this.providerBaseUrls[provider] || '';
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
    console.log("State updated:", this.state);
  }

  setApiKey(provider: Provider, key: string) {
    console.log(`Setting API key for ${provider}`);
    localStorage.setItem(`${provider}_api_key`, key);
  }

  stopStream() {
    console.log("Stopping stream");
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
      this.updateState({ streaming: false });
    }
  }

  async sendMessage(
    content: string,
    provider: Provider,
    options: ChatOptions
  ): Promise<Message> {
    console.log("Sending message:", { content, provider, options });
    
    try {
      this.updateState({ streaming: true });
      this.abortController = new AbortController();

      const userMessage: Message = {
        id: uuidv4(),
        content,
        isUser: true,
        timestamp: Date.now(),
        provider,
        model: options.model
      };

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
        messages: [...this.state.messages, userMessage, pendingMessage]
      });

      const response = await chatApi.sendMessage(content, provider, {
        ...options,
        baseUrl: this.getBaseUrl(provider),
        signal: this.abortController?.signal
      } as ChatOptions & { baseUrl?: string; signal?: AbortSignal });

      const updatedMessages = this.state.messages.map(msg => 
        msg.id === pendingMessage.id ? { ...response, id: msg.id } : msg
      );

      this.updateState({
        messages: updatedMessages,
        streaming: false
      });

      return response;
    } catch (error) {
      console.error("Error sending message:", error);
      
      if (error.name !== 'AbortError') {
        const messagesWithoutPending = this.state.messages.filter(
          msg => msg.pending !== true
        );
        
        this.updateState({
          messages: messagesWithoutPending,
          streaming: false
        });

        throw error;
      }
      
      this.updateState({ streaming: false });
      return {} as Message;
    }
  }

  async getModels(provider: Provider): Promise<string[]> {
    return chatApi.getModels(provider);
  }

  clearMessages() {
    console.log("Clearing all messages");
    this.updateState({ messages: [] });
    toast.success("Chat history cleared");
  }

  getMessages(): Message[] {
    return this.state.messages;
  }
}

export const chatService = new ChatService();