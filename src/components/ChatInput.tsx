import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Send } from "lucide-react";
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
    <div className="border-t p-4 bg-secondary">
      <div className="flex gap-2 max-w-3xl mx-auto">
        <Button 
          variant="outline" 
          size="icon" 
          className="shrink-0 bg-white hover:bg-gray-50"
          disabled={disabled}
        >
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
          disabled={disabled}
          className="flex-1 bg-white border-input focus:ring-primary"
        />
        <Button 
          onClick={handleSend} 
          size="icon"
          disabled={disabled}
          className="bg-primary hover:bg-primary-hover text-white shrink-0"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};