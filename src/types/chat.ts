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
  parentId?: string;
  context?: string;
  metadata?: {
    tokens?: number;
    processingTime?: number;
    attachments?: string[];
  };
}

export interface ProviderConfig {
  name: Provider;
  apiKey?: string;
  models: string[];
  isEnabled: boolean;
  baseUrl?: string;
  customHeaders?: Record<string, string>;
  streamingSupported?: boolean;
  functionCallingSupported?: boolean;
}

export interface ChatOptions {
  model: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  stream?: boolean;
  functions?: ChatFunction[];
  context?: string;
  useAttachmentModel?: boolean;
}

export interface ChatFunction {
  name: string;
  description: string;
  parameters: Record<string, any>;
}

export interface ChatState {
  messages: Message[];
  context: string;
  activeThread?: string;
  streaming: boolean;
  error?: string;
}