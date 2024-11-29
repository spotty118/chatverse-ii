export interface ChatError {
  code: string
  name: string
  message: string
}

export interface ChatMessageModel {
  id: string
  text: string
  author: 'user' | 'assistant'
  timestamp: string
  error?: ChatError
  loading?: boolean
  image?: File
}
