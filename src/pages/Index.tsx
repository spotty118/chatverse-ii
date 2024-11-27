import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Plus } from "lucide-react";
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

  const models = [
    "All-In-One",
    "GPT-4o",
    "GPT-4o mini",
    "GPT-4 Turbo",
    "g1-mini",
    "GPT-3.5",
    "Claude 3.5 Sonnet",
    "Claude 3.5 Haiku",
    "Claude 3 Opus",
  ];

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-64 bg-sidebar p-4">
        <div className="flex items-center gap-2 mb-6">
          <img src="/placeholder.svg" alt="Logo" className="h-8 w-8" />
          <span className="font-semibold text-lg">ChatVerse II</span>
        </div>
        
        <div className="space-y-1">
          {models.map((model) => (
            <button
              key={model}
              className="w-full text-left px-4 py-2 rounded-lg hover:bg-white/50 transition-colors"
            >
              {model}
            </button>
          ))}
        </div>

        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-white/50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Basic</span>
              <span>0 / 20</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Advanced</span>
              <span>2 / 0</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Images</span>
              <span>0 / 0</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4 max-w-3xl mx-auto">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`${
                  msg.isUser 
                    ? "ml-auto bg-primary text-white" 
                    : "bg-secondary text-foreground"
                } rounded-lg p-4 max-w-[80%] animate-fade-in`}
              >
                {msg.content}
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t p-4">
          <div className="flex gap-2 max-w-3xl mx-auto">
            <Button variant="outline" size="icon" className="shrink-0">
              <Plus className="h-4 w-4" />
            </Button>
            <Input
              placeholder="Use / to select prompts, Shift+Enter to add new line"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              className="flex-1 bg-background border-input text-foreground placeholder:text-muted focus:ring-primary"
            />
            <Button 
              onClick={handleSend} 
              size="icon"
              className="bg-primary hover:bg-primary/90 text-white shrink-0"
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