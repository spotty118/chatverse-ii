import { Dispatch, SetStateAction } from 'react';
import { Provider } from '@/types/chat';
import { Button } from '@/components/ui/button';
import { Trash2, Settings } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { chatApi } from '@/services/api/chatApi';

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
  // Fetch models for the selected provider
  const { data: models = [] } = useQuery({
    queryKey: ['models', selectedProvider],
    queryFn: () => chatApi.getModels(selectedProvider),
    meta: {
      onError: (error: Error) => {
        console.error("Error fetching models:", error);
      }
    }
  });

  const providers: { id: Provider; name: string; icon: string }[] = [
    { id: 'openai', name: 'OpenAI', icon: '🤖' },
    { id: 'anthropic', name: 'Anthropic', icon: '🧠' },
    { id: 'google', name: 'Google AI', icon: '🌐' },
    { id: 'mistral', name: 'Mistral', icon: '🌪️' },
    { id: 'ollama', name: 'Ollama', icon: '🦙' }
  ];

  return (
    <div className="w-64 bg-sidebar-bg text-foreground p-4 flex flex-col h-screen">
      <div className="flex items-center gap-2 mb-6">
        <img src="/placeholder.svg" alt="Logo" className="h-8 w-8" />
        <span className="font-semibold text-xl">Chat Hub</span>
      </div>
      
      <div className="space-y-4 flex-1 overflow-y-auto">
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground px-4">Providers</h3>
          {providers.map((provider) => (
            <button
              key={provider.id}
              onClick={() => {
                console.log("Selected provider:", provider.id);
                onProviderSelect(provider.id);
                // Reset model selection when changing provider
                if (models.length > 0) {
                  onModelSelect(models[0]);
                }
              }}
              className={`w-full text-left px-4 py-2.5 rounded-lg transition-colors flex items-center gap-2
                ${selectedProvider === provider.id 
                  ? 'bg-model-hover text-chat-blue' 
                  : 'hover:bg-model-hover'
                }`}
            >
              <span>{provider.icon}</span>
              <span className="text-sm">{provider.name}</span>
            </button>
          ))}
        </div>

        {models.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground px-4">Models</h3>
            {models.map((model) => (
              <button
                key={model}
                onClick={() => {
                  console.log("Selected model:", model);
                  onModelSelect(model);
                }}
                className={`w-full text-left px-4 py-2.5 rounded-lg transition-colors flex items-center gap-2
                  ${selectedModel === model 
                    ? 'bg-model-hover text-chat-blue' 
                    : 'hover:bg-model-hover'
                  }`}
              >
                <span className="text-sm">{model}</span>
              </button>
            ))}
          </div>
        )}
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