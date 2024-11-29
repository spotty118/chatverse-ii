import { ChatError } from '~utils/errors'

export interface ChatMessageModel {
  id: string
  text: string
  author: 'user' | 'assistant'
  timestamp: string
  loading?: boolean
  error?: ChatError
  imageUrl?: string
  image?: Blob
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