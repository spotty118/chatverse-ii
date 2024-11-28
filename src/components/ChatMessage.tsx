import { cn } from "@/lib/utils";
import { Loader2, FileText, Image as ImageIcon } from "lucide-react";

interface ChatMessageProps {
  content: string;
  isUser: boolean;
  pending?: boolean;
  attachments?: string[];
}

export const ChatMessage = ({ content, isUser, pending, attachments }: ChatMessageProps) => {
  const renderAttachment = (url: string) => {
    const isImage = url.match(/\.(jpg|jpeg|png|gif|webp)$/i);
    
    if (isImage) {
      return (
        <img 
          src={url} 
          alt="Attachment" 
          className="max-w-full h-auto rounded-lg max-h-[300px] object-contain bg-black/5"
        />
      );
    }
    
    return (
      <div className="flex items-center gap-2 text-sm">
        <FileText className="h-4 w-4" />
        <a 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="underline"
        >
          View attachment
        </a>
      </div>
    );
  };

  return (
    <div
      className={cn(
        "rounded-lg p-4 max-w-[80%] space-y-2",
        isUser
          ? "ml-auto bg-chat-blue text-white"
          : "bg-secondary text-foreground",
        !pending && "animate-in fade-in-0 slide-in-from-bottom-3"
      )}
    >
      {pending ? (
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Thinking...</span>
        </div>
      ) : (
        <>
          <div>{content}</div>
          {attachments && attachments.length > 0 && (
            <div className="space-y-2 mt-2">
              {attachments.map((url, index) => (
                <div key={index}>
                  {renderAttachment(url)}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};