import { Message, Provider, ChatOptions } from "@/types/chat";
import { handleOpenAIChat, streamOpenAIChat } from "../providers/openaiService";
import { handleAnthropicChat, streamAnthropicChat } from "../providers/anthropicService";
import { handleGoogleChat, streamGoogleChat } from "../providers/googleService";
import { handleMistralChat } from "../providers/mistralService";
import { handleOllamaChat } from "../providers/ollamaService";

const API_BASE_URL = import.meta.env.VITE_API_URL;

// Helper to determine if a model is a chat model
const isChatModel = (model: string): boolean => {
  return model.includes('gpt-') || model.includes('claude') || model.includes('gemini');
};

export const chatApi = {
  async sendMessage(content: string, provider: Provider, options: ChatOptions): Promise<Message> {
    console.log("Sending message to API:", { content, provider, options });
    
    const apiKey = localStorage.getItem(`${provider}_api_key`);
    if (!apiKey) {
      throw new Error(`No API key found for ${provider}`);
    }

    try {
      let response: string;
      const useChat = options.useAttachmentModel || isChatModel(options.model);
      console.log(`Using ${useChat ? 'chat' : 'completion'} endpoint for model ${options.model}`);

      switch (provider) {
        case 'openai':
          if (useChat) {
            response = options.stream 
              ? await streamOpenAIChat(content, options, apiKey, "https://api.openai.com/v1")
              : await handleOpenAIChat(content, options, apiKey, "https://api.openai.com/v1");
          } else {
            // Use completions endpoint for non-chat models
            const completionResponse = await fetch("https://api.openai.com/v1/completions", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
              },
              body: JSON.stringify({
                model: options.model,
                prompt: content,
                temperature: options.temperature || 0.7,
                max_tokens: options.maxTokens || 2048,
                stream: false
              })
            });

            if (!completionResponse.ok) {
              const error = await completionResponse.json();
              throw new Error(error.error?.message || "Failed to get response from OpenAI");
            }

            const data = await completionResponse.json();
            response = data.choices[0].text;
          }
          break;

        case 'anthropic':
          response = options.stream
            ? await streamAnthropicChat(content, options, apiKey, "https://api.anthropic.com/v1")
            : await handleAnthropicChat(content, options, apiKey, "https://api.anthropic.com/v1");
          break;

        case 'google':
          response = options.stream
            ? await streamGoogleChat(content, options, apiKey, "https://generativelanguage.googleapis.com/v1")
            : await handleGoogleChat(content, options, apiKey, "https://generativelanguage.googleapis.com/v1");
          break;

        case 'mistral':
          response = await handleMistralChat(content, options, apiKey, "https://api.mistral.ai/v1");
          break;

        case 'ollama':
          response = await handleOllamaChat(content, options, "http://localhost:11434");
          break;

        default:
          throw new Error(`Unsupported provider: ${provider}`);
      }

      return {
        id: crypto.randomUUID(),
        content: response,
        isUser: false,
        timestamp: Date.now(),
        provider,
        model: options.model
      };
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  },

  async getModels(provider: Provider): Promise<string[]> {
    console.log("Fetching models for provider:", provider);
    
    const apiKey = localStorage.getItem(`${provider}_api_key`);
    if (!apiKey) {
      console.log("No API key found, returning empty model list");
      return [];
    }

    try {
      let response: Response;
      let models: string[] = [];
      
      switch (provider) {
        case 'openai':
          response = await fetch("https://api.openai.com/v1/models", {
            headers: {
              "Authorization": `Bearer ${apiKey}`
            }
          });
          if (response.ok) {
            const data = await response.json();
            models = data.data
              .filter((model: any) => model.id.startsWith('gpt'))
              .map((model: any) => model.id);
          }
          break;

        case 'anthropic':
          // Anthropic doesn't have a models endpoint, return supported models
          models = ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'];
          break;

        case 'google':
          response = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`);
          if (response.ok) {
            const data = await response.json();
            models = data.models
              .filter((model: any) => model.name.includes('gemini'))
              .map((model: any) => model.name.split('/').pop());
          }
          break;

        case 'mistral':
          response = await fetch("https://api.mistral.ai/v1/models", {
            headers: {
              "Authorization": `Bearer ${apiKey}`
            }
          });
          if (response.ok) {
            const data = await response.json();
            models = data.data.map((model: any) => model.id);
          }
          break;

        case 'ollama':
          response = await fetch("http://localhost:11434/api/tags");
          if (response.ok) {
            const data = await response.json();
            models = data.models || [];
          }
          break;
      }

      console.log(`Fetched models for ${provider}:`, models);
      return models;
    } catch (error) {
      console.error("Error fetching models:", error);
      return [];
    }
  }
};