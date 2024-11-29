import { useCallback, useEffect, useState } from 'react'
import { produce } from 'immer'
import { ChatMessageModel } from '~types'
import { useChatContext } from '~app/context'

const useChat = () => {
  const [messages, setMessages] = useState<ChatMessageModel[]>([])
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

  useEffect(() => {
    if (conversation?.messages) {
      setMessages(conversation.messages)
    }
  }, [conversation?.messages])

  return {
    messages,
    handleUserSendMessage,
    resetChat,
  }
}

export default useChat