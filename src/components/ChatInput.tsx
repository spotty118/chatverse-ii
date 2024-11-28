import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Send, Image, Paperclip, Smile, Square } from "lucide-react";
import { useState, useRef } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supportsAttachments } from "@/utils/providerCapabilities";
import { Provider } from "@/types/chat";

interface ChatInputProps {
  onSend: (message: string, attachments?: File[]) => void;
  onStop: () => void;
  disabled?: boolean;
  provider: Provider;
  streaming?: boolean;
}

export const ChatInput = ({ onSend, onStop, disabled, provider, streaming }: ChatInputProps) => {
  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  const canUpload = supportsAttachments(provider);

  const handleSend = () => {
    if (!message.trim() && attachments.length === 0) {
      toast({
        title: "Message or attachments required",
        variant: "destructive"
      });
      return;
    }

    onSend(message, attachments);
    setMessage("");
    setAttachments([]);
  };

  const handleFileSelect = (files: FileList | null, type: 'image' | 'file') => {
    if (!files) return;
    
    if (!canUpload) {
      toast({
        title: `${type === 'image' ? 'Image' : 'File'} uploads not supported`,
        description: `The current AI provider (${provider}) does not support attachments`,
        variant: "destructive"
      });
      return;
    }

    const newFiles = Array.from(files);
    const totalSize = newFiles.reduce((sum, file) => sum + file.size, 0);
    
    if (totalSize > 25 * 1024 * 1024) { // 25MB limit
      toast({
        title: "Files too large",
        description: "Total attachment size must be under 25MB",
        variant: "destructive"
      });
      return;
    }

    if (type === 'image') {
      const invalidImages = newFiles.filter(file => !file.type.startsWith('image/'));
      if (invalidImages.length > 0) {
        toast({
          title: "Invalid file type",
          description: "Please select only image files",
          variant: "destructive"
        });
        return;
      }
    }

    setAttachments(prev => [...prev, ...newFiles]);
    toast({
      title: `${newFiles.length} ${type}${newFiles.length > 1 ? 's' : ''} added`,
      description: "Click send to upload with your message"
    });
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="border-t p-4 bg-background">
      {attachments.length > 0 && (
        <div className="flex gap-2 mb-2 flex-wrap max-w-5xl mx-auto">
          {attachments.map((file, index) => (
            <div 
              key={index}
              className="flex items-center gap-1 bg-secondary rounded-lg px-2 py-1"
            >
              <span className="text-sm truncate max-w-[200px]">{file.name}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4"
                onClick={() => removeAttachment(index)}
              >
                ×
              </Button>
            </div>
          ))}
        </div>
      )}
      
      <div className="flex gap-2 max-w-5xl mx-auto">
        <div className="flex gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-10 w-10"
            disabled={disabled}
            onClick={() => toast({
              title: "Coming soon",
              description: "Quick actions will be available in a future update"
            })}
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-10 w-10"
            disabled={disabled}
            onClick={() => imageInputRef.current?.click()}
          >
            <Image className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-10 w-10"
            disabled={disabled}
            onClick={() => fileInputRef.current?.click()}
          >
            <Paperclip className="h-4 w-4" />
          </Button>
        </div>

        <input
          type="file"
          ref={imageInputRef}
          className="hidden"
          accept="image/*"
          multiple
          onChange={(e) => handleFileSelect(e.target.files, 'image')}
        />
        
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          multiple
          onChange={(e) => handleFileSelect(e.target.files, 'file')}
        />

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
          onClick={() => toast({
            title: "Coming soon",
            description: "Emoji picker will be available in a future update"
          })}
        >
          <Smile className="h-4 w-4" />
        </Button>
        
        {streaming ? (
          <Button 
            onClick={onStop}
            variant="destructive"
            className="px-6"
          >
            <Square className="h-4 w-4 mr-2" />
            Stop
          </Button>
        ) : (
          <Button 
            onClick={handleSend} 
            disabled={disabled}
            className="bg-chat-blue hover:bg-chat-blue/90 text-white px-6"
          >
            <Send className="h-4 w-4 mr-2" />
            Send
          </Button>
        )}
      </div>
    </div>
  );
};