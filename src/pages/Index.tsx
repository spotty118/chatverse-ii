import { ScrollArea } from "@/components/ui/scroll-area";
import { useState, useEffect } from "react";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { Sidebar } from "@/components/Sidebar";
import { chatService } from "@/services/chatService";
import { configService } from "@/services/configService";
import { toast } from "sonner";
import { Message, Provider } from "@/types/chat";
import { v4 as uuidv4 } from "uuid";

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: uuidv4(),
      content: "Hello! How can I help you today?",
      isUser: false,
      timestamp: Date.now()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<Provider>('openai');
  const [selectedModel, setSelectedModel] = useState('gpt-4o');

  useEffect(() => {
    // Check for provider configurations on component mount
    const configs = configService.getProviderConfigs();
    const enabledProviders = configs.filter(c => c.isEnabled);
    
    if (enabledProviders.length === 0) {
      toast.error("Please configure at least one AI provider to start chatting");
    }
  }, []);

  const handleSendMessage = async (content: string) => {
    try {
      setIsLoading(true);
      console.log("Sending message:", content);
      
      // Add user message immediately
      const userMessage: Message = {
        id: uuidv4(),
        content,
        isUser: true,
        timestamp: Date.now(),
        provider: selectedProvider
      };
      setMessages(prev => [...prev, userMessage]);

      // Get AI response
      const response = await chatService.sendMessage(content, selectedProvider, selectedModel);
      console.log("Received response:", response);
      
      setMessages(prev => [...prev, response]);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-white">
      <Sidebar 
        onProviderSelect={setSelectedProvider}
        onModelSelect={setSelectedModel}
        selectedProvider={selectedProvider}
        selectedModel={selectedModel}
      />
      
      <div className="flex-1 flex flex-col">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4 max-w-3xl mx-auto">
            {messages.map((msg) => (
              <ChatMessage 
                key={msg.id} 
                content={msg.content} 
                isUser={msg.isUser} 
              />
            ))}
          </div>
        </ScrollArea>

        <ChatInput onSend={handleSendMessage} disabled={isLoading} />
      </div>
    </div>
  );
};

export default Index;