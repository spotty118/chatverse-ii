import React, { useCallback, useState } from 'react'
import ConversationPanel from '../components/Chat/ConversationPanel'
import { BotId, createBotInstance } from '../bots'
import { ChatMessageModel } from '~types'

const MultiBotChatPanel = () => {
  const [messages, setMessages] = useState<ChatMessageModel[]>([])
  const [generating, setGenerating] = useState(false)
  const defaultBotId: BotId = 'chatgpt'
  const bot = createBotInstance(defaultBotId)

  const handleUserSendMessage = useCallback((input: string, image?: File) => {
    // Handle message sending
    console.log('Sending message:', input)
    const newMessage: ChatMessageModel = {
      id: Date.now().toString(),
      author: 'user',
      text: input,
      image: image,
    }
    setMessages(prev => [...prev, newMessage])
  }, [])

  const resetConversation = useCallback(() => {
    setMessages([])
    console.log('Conversation reset')
  }, [])

  const stopGenerating = useCallback(() => {
    setGenerating(false)
    console.log('Generation stopped')
  }, [])

  return (
    <div className="h-full">
      <ConversationPanel
        botId={defaultBotId}
        bot={bot}
        messages={messages}
        onUserSendMessage={handleUserSendMessage}
        resetConversation={resetConversation}
        generating={generating}
        stopGenerating={stopGenerating}
      />
    </div>
  )
}

export default MultiBotChatPanel