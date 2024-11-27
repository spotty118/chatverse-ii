import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Send, Image, Paperclip, Smile } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export const ChatInput = ({ onSend, disabled }: ChatInputProps) => {
  const [message, setMessage] = useState("");
  const { toast } = useToast();

  const handleSend = () => {
    if (!message.trim()) {
      toast({
        title: "Message cannot be empty",
        variant: "destructive"
      });
      return;
    }

    onSend(message);
    setMessage("");
  };

  return (
    <div className="border-t p-4 bg-background">
      <div className="flex gap-2 max-w-5xl mx-auto">
        <div className="flex gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-10 w-10"
            disabled={disabled}
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-10 w-10"
            disabled={disabled}
          >
            <Image className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-10 w-10"
            disabled={disabled}
          >
            <Paperclip className="h-4 w-4" />
          </Button>
        </div>
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
          disabled={disabled}
          className="flex-1"
        />
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-10 w-10"
          disabled={disabled}
        >
          <Smile className="h-4 w-4" />
        </Button>
        <Button 
          onClick={handleSend} 
          disabled={disabled}
          className="bg-chat-blue hover:bg-chat-blue/90 text-white px-6"
        >
          Send
        </Button>
      </div>
    </div>
  );
};