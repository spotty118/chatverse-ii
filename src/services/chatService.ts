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

  async sendMessage(
    content: string,
    provider: Provider,
    options: ChatOptions
  ): Promise<Message> {
    console.log("Sending message:", { content, provider, options });
    
    let pendingMessage: Message | undefined;
    
    try {
      this.updateState({ streaming: true });

      // Add user message immediately
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

      // Add pending assistant message
      pendingMessage = {
        id: uuidv4(),
        content: "",
        isUser: false,
        timestamp: Date.now(),
        provider,
        model: options.model,
        pending: true
      };

      this.updateState({
        messages: [...this.state.messages, pendingMessage]
      });

      // Send message to API
      const response = await chatApi.sendMessage(content, provider, options);

      // Update pending message with response
      const updatedMessages = this.state.messages.map(msg => 
        msg.id === pendingMessage?.id ? { ...response, id: msg.id } : msg
      );

      this.updateState({
        messages: updatedMessages,
        streaming: false
      });

      return response;
    } catch (error) {
      console.error("Error sending message:", error);
      
      // Remove pending message on error
      if (pendingMessage) {
        const messagesWithoutPending = this.state.messages.filter(
          msg => msg.id !== pendingMessage.id
        );
        
        this.updateState({
          messages: messagesWithoutPending,
          streaming: false
        });
      }

      throw error;
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