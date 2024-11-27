import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Settings as SettingsIcon } from "lucide-react";
import { useState } from "react";
import { chatService } from "@/services/chatService";
import { Provider } from "@/types/chat";
import { toast } from "sonner";

export const Settings = () => {
  const [open, setOpen] = useState(false);
  const [keys, setKeys] = useState<Record<Provider, string>>({
    openai: localStorage.getItem('openai_api_key') || '',
    anthropic: localStorage.getItem('anthropic_api_key') || '',
    google: localStorage.getItem('google_api_key') || '',
    mistral: localStorage.getItem('mistral_api_key') || '',
    ollama: localStorage.getItem('ollama_api_key') || ''
  });

  const handleSave = async (provider: Provider, key: string) => {
    console.log(`Saving API key for ${provider}`);
    chatService.setApiKey(provider, key);
    setKeys(prev => ({ ...prev, [provider]: key }));
    
    try {
      // Trigger a model fetch when saving a new API key
      await chatService.fetchModels(provider);
      toast.success(`${provider} API key saved successfully`);
    } catch (error) {
      console.error(`Error fetching models for ${provider}:`, error);
      toast.error(`Failed to validate ${provider} API key`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="w-8 h-8">
          <SettingsIcon className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>API Keys</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-4">
            {Object.entries(keys).map(([provider, key]) => (
              <div key={provider} className="grid grid-cols-4 items-center gap-4">
                <label htmlFor={provider} className="text-right capitalize">
                  {provider}:
                </label>
                <div className="col-span-3">
                  <Input
                    id={provider}
                    type="password"
                    value={key}
                    onChange={(e) => setKeys(prev => ({ ...prev, [provider]: e.target.value }))}
                    onBlur={(e) => handleSave(provider as Provider, e.target.value)}
                    placeholder={`Enter ${provider} API key`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};