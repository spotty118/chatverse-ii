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

  private subscribers: ((state: ChatState) => void)[] = [];
  private messageInProgress = false;

  constructor() {
    console.log("ChatService initialized");
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

  async fetchModels(provider: Provider): Promise<string[]> {
    console.log(`Fetching models for ${provider}`);
    const apiKey = localStorage.getItem(`${provider}_api_key`);
    
    if (!apiKey) {
      console.log(`No API key found for ${provider}`);
      return [];
    }

    try {
      const models = await chatApi.getModels(provider);
      console.log(`Fetched models for ${provider}:`, models);
      return models;
    } catch (error) {
      console.error(`Error fetching models for ${provider}:`, error);
      throw error;
    }
  }

  async sendMessage(
    content: string,
    provider: Provider,
    options: ChatOptions
  ): Promise<Message> {
    console.log("Sending message:", { content, provider, options });
    
    if (this.messageInProgress) {
      console.log("Message already in progress, ignoring duplicate request");
      return Promise.reject(new Error("Message already in progress"));
    }
    
    try {
      this.messageInProgress = true;
      this.updateState({ streaming: true });

      // Create user message
      const userMessage: Message = {
        id: uuidv4(),
        content,
        isUser: true,
        timestamp: Date.now(),
        provider,
        model: options.model
      };

      // Create pending assistant message
      const pendingMessage: Message = {
        id: uuidv4(),
        content: "",
        isUser: false,
        timestamp: Date.now(),
        provider,
        model: options.model,
        pending: true
      };

      // Update state with both messages at once
      this.updateState({
        messages: [...this.state.messages, userMessage, pendingMessage]
      });

      // Send message to API
      const response = await chatApi.sendMessage(content, provider, options);

      // Update pending message with response
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
      
      // Remove only the pending message on error
      const messagesWithoutPending = this.state.messages.filter(
        msg => msg.pending !== true
      );
      
      this.updateState({
        messages: messagesWithoutPending,
        streaming: false
      });

      throw error;
    } finally {
      this.messageInProgress = false;
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