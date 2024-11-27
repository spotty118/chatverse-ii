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
    ollama: localStorage.getItem('ollama_api_key') || ''
  });
  const [useCloudflare, setUseCloudflare] = useState(localStorage.getItem('use_cloudflare') === 'true');
  const [cloudflareUrl, setCloudflareUrl] = useState(localStorage.getItem('cloudflare_url') || '');
  const [googleUrl, setGoogleUrl] = useState(localStorage.getItem('google_url') || '');

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
      chatService.setBaseUrl(''); // Reset to default direct API
      toast.success('Switched to direct API calls');
    } else if (cloudflareUrl) {
      chatService.setBaseUrl(cloudflareUrl);
      toast.success('Switched to Cloudflare AI Gateway');
    }
  };

  const handleCloudflareUrlSave = () => {
    console.log('Saving Cloudflare URL:', cloudflareUrl);
    localStorage.setItem('cloudflare_url', cloudflareUrl);
    if (useCloudflare && cloudflareUrl) {
      chatService.setBaseUrl(cloudflareUrl);
      toast.success('Cloudflare AI Gateway URL updated');
    }
  };

  const handleGoogleUrlSave = () => {
    console.log('Saving Google URL:', googleUrl);
    localStorage.setItem('google_url', googleUrl);
    if (googleUrl) {
      chatService.setBaseUrl(googleUrl);
      toast.success('Google API URL updated');
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
            <div className="grid grid-cols-4 items-center gap-4 mb-4">
              <Label htmlFor="cloudflare-url" className="text-right">
                Gateway URL:
              </Label>
              <div className="col-span-3">
                <Input
                  id="cloudflare-url"
                  value={cloudflareUrl}
                  onChange={(e) => setCloudflareUrl(e.target.value)}
                  onBlur={handleCloudflareUrlSave}
                  placeholder="Enter Cloudflare AI Gateway URL"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-4 items-center gap-4 mb-4">
            <Label htmlFor="google-url" className="text-right">
              Google URL:
            </Label>
            <div className="col-span-3">
              <Input
                id="google-url"
                value={googleUrl}
                onChange={(e) => setGoogleUrl(e.target.value)}
                onBlur={handleGoogleUrlSave}
                placeholder="Enter Google API URL"
              />
            </div>
          </div>

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