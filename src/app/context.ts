import { createContext, useContext } from 'react'

export interface ConversationContextValue {
  reset: () => void
  messages?: any[] // TODO: Add proper type
}

export const ConversationContext = createContext<ConversationContextValue | null>(null)

export const useChatContext = () => {
  const context = useContext(ConversationContext)
  if (!context) {
    throw new Error('useChatContext must be used within a ConversationProvider')
  }
  return context
}