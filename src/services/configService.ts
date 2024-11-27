import { ProviderConfig } from '@/types/chat';

class ConfigService {
  private readonly STORAGE_KEY = 'provider_configs';

  getProviderConfigs(): ProviderConfig[] {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (!stored) {
      return this.getDefaultConfigs();
    }
    return JSON.parse(stored);
  }

  setProviderConfig(config: ProviderConfig) {
    const configs = this.getProviderConfigs();
    const index = configs.findIndex(c => c.name === config.name);
    
    if (index !== -1) {
      configs[index] = config;
    } else {
      configs.push(config);
    }
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(configs));
  }

  private getDefaultConfigs(): ProviderConfig[] {
    return [
      {
        name: 'openai',
        models: ['gpt-4', 'gpt-3.5-turbo'],
        isEnabled: true
      },
      {
        name: 'anthropic',
        models: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'],
        isEnabled: false
      },
      {
        name: 'google',
        models: ['gemini-pro'],
        isEnabled: false
      },
      {
        name: 'mistral',
        models: ['mistral-tiny', 'mistral-small', 'mistral-medium'],
        isEnabled: false
      },
      {
        name: 'ollama',
        models: ['llama2', 'mistral', 'codellama'],
        isEnabled: false
      }
    ];
  }
}

export const configService = new ConfigService();