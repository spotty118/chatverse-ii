import { Dispatch, SetStateAction } from 'react';
import { Provider } from '@/types/chat';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

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
    <div className="w-64 bg-[#F6F7F9] p-4 flex flex-col">
      <div className="flex items-center gap-2 mb-6">
        <img src="/placeholder.svg" alt="Logo" className="h-8 w-8" />
        <span className="font-semibold text-lg">ChatVerse II</span>
      </div>
      
      <div className="space-y-1 flex-1">
        {models.map((model) => (
          <button
            key={model.name}
            onClick={() => {
              if (model.provider) {
                onProviderSelect(model.provider);
              }
              onModelSelect(model.name);
            }}
            className={`w-full text-left px-4 py-2 rounded-lg hover:bg-white/50 transition-colors ${
              selectedModel === model.name ? 'bg-white/50' : ''
            }`}
          >
            {model.name}
          </button>
        ))}
      </div>

      <div className="mt-4 border-t pt-4">
        <Button
          variant="outline"
          className="w-full flex items-center gap-2"
          onClick={onClearChat}
        >
          <Trash2 className="h-4 w-4" />
          Clear Chat
        </Button>
      </div>

      <div className="mt-4">
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
  );
};