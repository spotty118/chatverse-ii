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
  model?: string;
  error?: string;
  pending?: boolean;
}

export interface ProviderConfig {
  name: Provider;
  apiKey?: string;
  models: string[];
  isEnabled: boolean;
  baseUrl?: string;
  customHeaders?: Record<string, string>;
}

export interface ChatOptions {
  model: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}