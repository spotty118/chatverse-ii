import { Dispatch, SetStateAction } from 'react';
import { Provider } from '@/types/chat';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { Settings } from './Settings';

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
  selectedProvider, 
  selectedModel,
  onClearChat 
}: SidebarProps) => {
  const models: { name: string; provider?: Provider }[] = [
    { name: "All-In-One" },
    { name: "GPT-4o", provider: "openai" },
    { name: "GPT-4o mini", provider: "openai" },
    { name: "GPT-4 Turbo", provider: "openai" },
    { name: "g1-mini", provider: "google" },
    { name: "GPT-3.5", provider: "openai" },
    { name: "Claude 3.5 Sonnet", provider: "anthropic" },
    { name: "Claude 3.5 Haiku", provider: "anthropic" },
    { name: "Claude 3 Opus", provider: "anthropic" },
  ];

  return (
    <div className="w-64 bg-primary text-white p-5 flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <img src="/placeholder.svg" alt="Logo" className="h-8 w-8" />
          <span className="font-bold text-2xl">Chat Hub</span>
        </div>
        <Settings />
      </div>
      
      <div className="mb-6">
        <div className="font-bold text-lg mb-2">FREE PLAN</div>
        <div className="space-y-1 text-sm">
          <div>Basic: 0/20</div>
          <div>Advanced: 2/6</div>
          <div>Images: 0/6</div>
        </div>
      </div>

      <div className="space-y-2 flex-1">
        {models.map((model) => (
          <button
            key={model.name}
            onClick={() => {
              if (model.provider) {
                onProviderSelect(model.provider);
              }
              onModelSelect(model.name);
            }}
            className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
              selectedModel === model.name 
                ? 'bg-primary-hover' 
                : 'hover:bg-primary-hover'
            }`}
          >
            {model.name}
          </button>
        ))}
      </div>

      <Button
        variant="outline"
        className="mt-4 w-full flex items-center gap-2 bg-primary-hover hover:bg-accent text-white border-white/20"
        onClick={onClearChat}
      >
        <Trash2 className="h-4 w-4" />
        Clear Chat
      </Button>
    </div>
  );
};