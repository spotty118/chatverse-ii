import { Dispatch, SetStateAction } from 'react';
import { Provider } from '@/types/chat';
import { Button } from '@/components/ui/button';
import { Trash2, Circle, Settings } from 'lucide-react';

interface SidebarProps {
  onProviderSelect: Dispatch<SetStateAction<Provider>>;
  onModelSelect: Dispatch<SetStateAction<string>>;
  selectedProvider: Provider;
  selectedModel: string;
  onClearChat: () => void;
}

export const Sidebar = ({ 
  onProviderSelect, 
  onModelSelect, 
  selectedModel,
  onClearChat 
}: SidebarProps) => {
  const models = [
    { name: "All-In-One", icon: "🤖" },
    { name: "GPT-4o", provider: "openai" },
    { name: "GPT-4o mini", provider: "openai" },
    { name: "GPT-4 Turbo", provider: "openai" },
    { name: "o1-mini", provider: "google" },
    { name: "GPT-3.5", provider: "openai" },
    { name: "Claude 3.5 Sonnet", provider: "anthropic" },
    { name: "Claude 3.5 Haiku", provider: "anthropic" },
    { name: "Claude 3 Opus", provider: "anthropic" },
    { name: "Claude 3 Haiku", provider: "anthropic" },
  ];

  return (
    <div className="w-64 bg-sidebar-bg text-foreground p-4 flex flex-col h-screen">
      <div className="flex items-center gap-2 mb-6">
        <img src="/placeholder.svg" alt="Logo" className="h-8 w-8" />
        <span className="font-semibold text-xl">Chat Hub</span>
      </div>
      
      <div className="space-y-2 flex-1 overflow-y-auto">
        {models.map((model) => (
          <button
            key={model.name}
            onClick={() => {
              if (model.provider) {
                onProviderSelect(model.provider as Provider);
              }
              onModelSelect(model.name);
            }}
            className={`w-full text-left px-4 py-2.5 rounded-lg transition-colors flex items-center gap-2
              ${selectedModel === model.name 
                ? 'bg-model-hover text-chat-blue' 
                : 'hover:bg-model-hover'
              }`}
          >
            {model.icon ? (
              <span>{model.icon}</span>
            ) : (
              <Circle className="h-4 w-4" />
            )}
            <span className="text-sm">{model.name}</span>
          </button>
        ))}
      </div>

      <Button
        variant="ghost"
        className="mt-4 w-full justify-start gap-2 text-muted hover:text-foreground"
        onClick={onClearChat}
      >
        <Trash2 className="h-4 w-4" />
        Clear Chat
      </Button>
    </div>
  );
};