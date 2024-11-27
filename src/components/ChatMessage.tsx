import { cn } from "@/lib/utils";

interface ChatMessageProps {
  content: string;
  isUser: boolean;
}

export const ChatMessage = ({ content, isUser }: ChatMessageProps) => {
  return (
    <div
      className={cn(
        "rounded-lg p-4 max-w-[80%] animate-fade-in",
        isUser
          ? "ml-auto bg-primary text-white"
          : "bg-[#F6F7F9] text-[#1E1E1E]"
      )}
    >
      {content}
    </div>
  );
};