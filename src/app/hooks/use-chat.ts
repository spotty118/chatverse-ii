import { useCallback, useEffect, useState } from 'react'
import { produce } from 'immer'
import { ChatMessageModel } from '~types'
import { useChatContext } from '~app/context'

export const useChat = (botId?: string) => {
  const [messages, setMessages] = useState<ChatMessageModel[]>([])
  const [generating, setGenerating] = useState(false)
  const conversation = useChatContext()

  const handleUserSendMessage = useCallback(
    (text: string, image?: File) => {
      const newMessage: ChatMessageModel = {
        id: Date.now().toString(),
        text,
        image,
        author: 'user',
        timestamp: new Date().toISOString()
      }
      setMessages(produce((draft: ChatMessageModel[]) => {
        draft.push(newMessage)
      }))
    },
    []
  )

  const resetChat = useCallback(() => {
    setMessages([])
    conversation?.reset()
  }, [conversation])

  const stopGenerating = useCallback(() => {
    setGenerating(false)
  }, [])

  const sendMessage = useCallback((text: string) => {
    handleUserSendMessage(text)
    setGenerating(true)
  }, [handleUserSendMessage])

  useEffect(() => {
    if (conversation?.messages) {
      setMessages(conversation.messages)
    }
  }, [conversation?.messages])

  return {
    messages,
    handleUserSendMessage,
    resetChat,
    generating,
    stopGenerating,
    sendMessage,
    resetConversation: resetChat,
    bot: botId
  }
}

export default useChat