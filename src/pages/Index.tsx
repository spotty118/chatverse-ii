import { ScrollArea } from "@/components/ui/scroll-area";
import { useState, useEffect } from "react";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { Sidebar } from "@/components/Sidebar";
import { chatService, ChatResponse } from "@/services/chatService";
import { toast } from "sonner";

const Index = () => {
  const [messages, setMessages] = useState<ChatResponse[]>([
    { content: "Hello! How can I help you today?", isUser: false }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check for API key on component mount
    const apiKey = chatService.getApiKey();
    if (!apiKey) {
      toast.error("Please set your OpenAI API key to start chatting");
    }
  }, []);

  const handleSendMessage = async (message: string) => {
    try {
      setIsLoading(true);
      console.log("Sending message:", message);
      
      // Add user message immediately
      const userMessage: ChatResponse = { content: message, isUser: true };
      setMessages(prev => [...prev, userMessage]);

      // Get AI response
      const response = await chatService.sendMessage(message);
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
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4 max-w-3xl mx-auto">
            {messages.map((msg, index) => (
              <ChatMessage key={index} content={msg.content} isUser={msg.isUser} />
            ))}
          </div>
        </ScrollArea>

        <ChatInput onSend={handleSendMessage} disabled={isLoading} />
      </div>
    </div>
  );
};

export default Index;