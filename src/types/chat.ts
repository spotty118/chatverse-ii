export type Provider = 
  | 'openai' 
  | 'anthropic' 
  | 'google' 
  | 'mistral'
  | 'ollama';

export interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: number;
  provider?: Provider;
}

export interface ProviderConfig {
  name: Provider;
  apiKey?: string;
  models: string[];
  isEnabled: boolean;
}