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
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-64 border-r border-border p-4 hidden md:block">
        <h2 className="font-semibold mb-4 text-primary">Chat History</h2>
        <div className="space-y-2">
          <div className="p-2 hover:bg-secondary rounded-lg cursor-pointer text-foreground/70 transition-colors">
            New Chat
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`${
                  msg.isUser 
                    ? "ml-auto bg-primary text-white" 
                    : "bg-secondary text-foreground/90"
                } rounded-lg p-4 max-w-[80%] animate-fade-in`}
              >
                {msg.content}
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t border-border p-4">
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
              className="flex-1 bg-secondary border-input text-foreground placeholder:text-foreground/50 focus:ring-primary"
            />
            <Button 
              onClick={handleSend} 
              size="icon"
              className="bg-primary hover:bg-primary/90 text-white"
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