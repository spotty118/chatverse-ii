import { ScrollArea } from "@/components/ui/scroll-area";
import { useState, useEffect } from "react";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { Sidebar } from "@/components/Sidebar";
import { chatService } from "@/services/chatService";
import { configService } from "@/services/configService";
import { toast } from "sonner";
import { Message, Provider, ChatState } from "@/types/chat";
import { useQuery } from "@tanstack/react-query";
import { chatApi } from "@/services/api/chatApi";

const Index = () => {
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    context: "",
    streaming: false
  });
  
  const [selectedProvider, setSelectedProvider] = useState<Provider>('openai');
  const [selectedModel, setSelectedModel] = useState('gpt-4o');

  // Fetch available models for the selected provider
  const { data: models } = useQuery({
    queryKey: ['models', selectedProvider],
    queryFn: () => chatApi.getModels(selectedProvider),
    meta: {
      onError: (error: Error) => {
        console.error("Error fetching models:", error);
        toast.error("Failed to load available models");
      }
    }
  });

  useEffect(() => {
    console.log("Initializing chat component");
    
    // Load existing messages
    const messages = chatService.getMessages();
    setChatState(prev => ({ ...prev, messages }));

    // Subscribe to chat service updates
    const unsubscribe = chatService.subscribe((state) => {
      console.log("Chat state updated:", state);
      setChatState(state);
      
      // Scroll to bottom on new messages
      const chatContainer = document.querySelector('.chat-scroll-area');
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    });

    // Check for provider configurations
    const configs = configService.getProviderConfigs();
    const enabledProviders = configs.filter(c => c.isEnabled);
    
    if (enabledProviders.length === 0) {
      toast.error("Please configure at least one AI provider to start chatting");
    }

    return () => {
      console.log("Cleaning up chat component");
      unsubscribe();
    };
  }, []);

  const handleSendMessage = async (content: string) => {
    console.log("Handling send message:", content);
    
    try {
      await chatService.sendMessage(content, selectedProvider, {
        model: selectedModel,
        temperature: 0.7,
        maxTokens: 2048,
        stream: true
      });
    } catch (error) {
      console.error("Error in chat:", error);
      toast.error("Failed to get response. Please try again.");
    }
  };

  const handleClearChat = () => {
    console.log("Clearing chat history");
    chatService.clearMessages();
  };

  return (
    <div className="flex h-screen bg-white">
      <Sidebar 
        onProviderSelect={setSelectedProvider}
        onModelSelect={setSelectedModel}
        selectedProvider={selectedProvider}
        selectedModel={selectedModel}
        onClearChat={handleClearChat}
      />
      
      <div className="flex-1 flex flex-col">
        <ScrollArea className="flex-1 p-4 chat-scroll-area">
          <div className="space-y-4 max-w-3xl mx-auto">
            {chatState.messages.map((msg) => (
              <ChatMessage 
                key={msg.id} 
                content={msg.content} 
                isUser={msg.isUser} 
                pending={msg.pending}
              />
            ))}
          </div>
        </ScrollArea>

        <ChatInput 
          onSend={handleSendMessage} 
          disabled={chatState.streaming} 
        />
      </div>
    </div>
  );
};

export default Index;