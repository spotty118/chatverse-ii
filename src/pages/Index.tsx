import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { Sidebar } from "@/components/Sidebar";

interface ChatMessage {
  content: string;
  isUser: boolean;
}

const Index = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { content: "Hello! How can I help you today?", isUser: false }
  ]);

  const handleSendMessage = (message: string) => {
    const userMessage: ChatMessage = { content: message, isUser: true };
    setMessages(prev => [...prev, userMessage]);

    const botMessage: ChatMessage = {
      content: "This is a demo response. The AI integration will be implemented later.",
      isUser: false
    };
    setTimeout(() => {
      setMessages(prev => [...prev, botMessage]);
    }, 1000);
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

        <ChatInput onSend={handleSendMessage} />
      </div>
    </div>
  );
};

export default Index;