import { Provider } from "@/types/chat";

interface ProviderCapabilities {
  attachments: boolean;
  streaming: boolean;
  functionCalling: boolean;
}

const capabilities: Record<Provider, ProviderCapabilities> = {
  openai: {
    attachments: true,
    streaming: true,
    functionCalling: true
  },
  anthropic: {
    attachments: false,
    streaming: true,
    functionCalling: false
  },
  google: {
    attachments: true,
    streaming: true,
    functionCalling: true
  },
  mistral: {
    attachments: false,
    streaming: true,
    functionCalling: false
  },
  ollama: {
    attachments: false,
    streaming: true,
    functionCalling: false
  },
  openrouter: {
    attachments: false,
    streaming: true,
    functionCalling: false
  }
};

export const getProviderCapabilities = (provider: Provider): ProviderCapabilities => {
  return capabilities[provider];
};

export const supportsAttachments = (provider: Provider): boolean => {
  return capabilities[provider].attachments;
};