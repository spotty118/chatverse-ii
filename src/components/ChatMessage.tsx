import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface ChatMessageProps {
  content: string;
  isUser: boolean;
  pending?: boolean;
}

export const ChatMessage = ({ content, isUser, pending }: ChatMessageProps) => {
  return (
    <div
      className={cn(
        "rounded-lg p-4 max-w-[80%] animate-fade-in shadow-sm",
        isUser
          ? "ml-auto bg-primary text-white"
          : "bg-white text-foreground"
      )}
    >
      {pending ? (
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Thinking...</span>
        </div>
      ) : (
        content
      )}
    </div>
  );
};