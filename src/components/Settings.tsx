import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Settings as SettingsIcon } from "lucide-react";
import { useState } from "react";
import { chatService } from "@/services/chatService";
import { Provider } from "@/types/chat";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export const Settings = () => {
  const [open, setOpen] = useState(false);
  const [keys, setKeys] = useState<Record<Provider, string>>({
    openai: localStorage.getItem('openai_api_key') || '',
    anthropic: localStorage.getItem('anthropic_api_key') || '',
    google: localStorage.getItem('google_api_key') || '',
    mistral: localStorage.getItem('mistral_api_key') || '',
    ollama: localStorage.getItem('ollama_api_key') || '',
    openrouter: localStorage.getItem('openrouter_api_key') || ''
  });
  const [useCloudflare, setUseCloudflare] = useState(localStorage.getItem('use_cloudflare') === 'true');
  const [cloudflareUrls, setCloudflareUrls] = useState<Record<Provider, string>>({
    openai: localStorage.getItem('cloudflare_url_openai') || '',
    anthropic: localStorage.getItem('cloudflare_url_anthropic') || '',
    google: localStorage.getItem('cloudflare_url_google') || '',
    mistral: localStorage.getItem('cloudflare_url_mistral') || '',
    ollama: localStorage.getItem('cloudflare_url_ollama') || '',
    openrouter: localStorage.getItem('cloudflare_url_openrouter') || ''
  });

  const handleSave = async (provider: Provider, key: string) => {
    console.log(`Saving API key for ${provider}`);
    chatService.setApiKey(provider, key);
    setKeys(prev => ({ ...prev, [provider]: key }));
    
    try {
      await chatService.getModels(provider);
      toast.success(`${provider} API key saved successfully`);
    } catch (error) {
      console.error(`Error fetching models for ${provider}:`, error);
      toast.error(`Failed to validate ${provider} API key`);
    }
  };

  const handleCloudflareToggle = (checked: boolean) => {
    console.log('Toggling Cloudflare usage:', checked);
    setUseCloudflare(checked);
    localStorage.setItem('use_cloudflare', checked.toString());
    
    if (!checked) {
      chatService.setProviderBaseUrls({}); // Reset to default direct APIs
      toast.success('Switched to direct API calls');
    } else {
      chatService.setProviderBaseUrls(cloudflareUrls);
      toast.success('Switched to Cloudflare AI Gateway');
    }
  };

  const handleCloudflareUrlSave = (provider: Provider, url: string) => {
    console.log(`Saving Cloudflare URL for ${provider}:`, url);
    localStorage.setItem(`cloudflare_url_${provider}`, url);
    setCloudflareUrls(prev => ({ ...prev, [provider]: url }));
    
    if (useCloudflare) {
      chatService.setProviderBaseUrls({ ...cloudflareUrls, [provider]: url });
      toast.success(`Cloudflare AI Gateway URL for ${provider} updated`);
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
          <DialogTitle>API Settings</DialogTitle>
        </DialogHeader>
        <form className="grid gap-4 py-4" onSubmit={(e) => e.preventDefault()}>
          <div className="flex items-center space-x-2 mb-4">
            <Switch
              id="cloudflare-mode"
              checked={useCloudflare}
              onCheckedChange={handleCloudflareToggle}
            />
            <Label htmlFor="cloudflare-mode">Use Cloudflare AI Gateway</Label>
          </div>

          {useCloudflare && (
            <div className="space-y-4">
              {Object.entries(cloudflareUrls).map(([provider, url]) => (
                <div key={provider} className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor={`cloudflare-url-${provider}`} className="text-right capitalize">
                    {provider} URL:
                  </Label>
                  <div className="col-span-3">
                    <Input
                      id={`cloudflare-url-${provider}`}
                      value={url}
                      onChange={(e) => setCloudflareUrls(prev => ({ ...prev, [provider]: e.target.value }))}
                      onBlur={(e) => handleCloudflareUrlSave(provider as Provider, e.target.value)}
                      placeholder={`Enter ${provider} Cloudflare Gateway URL`}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

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
        </form>
      </DialogContent>
    </Dialog>
  );
};