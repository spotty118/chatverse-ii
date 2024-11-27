import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

interface ChatMessage {
  content: string;
  isUser: boolean;
}

const Index = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    { content: "Hello! How can I help you today?", isUser: false }
  ]);
  const { toast } = useToast();

  const handleSend = () => {
    if (!message.trim()) {
      toast({
        title: "Message cannot be empty",
        variant: "destructive"
      });
      return;
    }

    const userMessage: ChatMessage = { content: message, isUser: true };
    setMessages(prev => [...prev, userMessage]);

    const botMessage: ChatMessage = {
      content: "This is a demo response. The AI integration will be implemented later.",
      isUser: false
    };
    setTimeout(() => {
      setMessages(prev => [...prev, botMessage]);
    }, 1000);

    setMessage("");
  };

  return (
    <div className="flex h-screen bg-[#1A1F2C]">
      {/* Sidebar */}
      <div className="w-64 border-r border-[#2A2F3C] p-4 hidden md:block">
        <h2 className="font-semibold mb-4 text-[#9b87f5]">Chat History</h2>
        <div className="space-y-2">
          <div className="p-2 hover:bg-[#2A2F3C] rounded-lg cursor-pointer text-gray-300 transition-colors">
            New Chat
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-[#1A1F2C]">
        {/* Chat Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`${
                  msg.isUser 
                    ? "ml-auto bg-[#9b87f5] text-white" 
                    : "bg-[#2A2F3C] text-gray-200"
                } rounded-lg p-4 max-w-[80%] animate-fade-in`}
              >
                {msg.content}
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t border-[#2A2F3C] p-4 bg-[#1A1F2C]">
          <div className="flex gap-2 max-w-4xl mx-auto">
            <Input
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              className="flex-1 bg-[#2A2F3C] border-[#3A3F4C] text-gray-200 placeholder:text-gray-400 focus:ring-[#9b87f5]"
            />
            <Button 
              onClick={handleSend} 
              size="icon"
              className="bg-[#9b87f5] hover:bg-[#8b77e5] text-white"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;