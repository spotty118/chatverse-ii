export interface ChatMessageModel {
  id: string
  text: string
  author: 'user' | 'assistant'
  timestamp: string
  loading?: boolean
  error?: {
    message: string
    code?: string
  }
  imageUrl?: string
}

export interface UserConfig {
  theme: 'light' | 'dark' | 'system'
  language: string
}

export interface ChatBot {
  id: string
  name: string
  avatar: string
  description: string
  capabilities: string[]
  isEnabled: boolean
}
