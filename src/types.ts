import { ErrorCode } from '~utils/errors'

export interface ChatError {
  code: ErrorCode
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