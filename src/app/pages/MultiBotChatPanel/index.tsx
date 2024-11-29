import React, { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import ChatHeader from '../../components/Chat/ChatHeader'
import ChatInput from '../../components/Chat/ChatInput'
import ChatMessageCard from '../../components/Chat/ChatMessageCard'
import { ChatMessageModel } from '~/types'
import { ErrorCode } from '~/utils/errors'

const MultiBotChatPanel = () => {
  const navigate = useNavigate()
  const [messages, setMessages] = useState<ChatMessageModel[]>([])

  const handleSend = async (text: string) => {
    const userMessage: ChatMessageModel = {
      id: Date.now().toString(),
      text,
      author: 'user',
      timestamp: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, userMessage])

    const loadingMessage: ChatMessageModel = {
      id: (Date.now() + 1).toString(),
      text: '',
      author: 'assistant',
      loading: true,
      timestamp: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, loadingMessage])

    try {
      const response = await new Promise((resolve) => 
        setTimeout(() => resolve("Hello! I'm your AI assistant. How can I help you today?"), 1000)
      )

      setMessages((prev) => 
        prev.map((msg) => 
          msg.id === loadingMessage.id
            ? {
                ...msg,
                text: response as string,
                loading: false,
              }
            : msg
        )
      )
    } catch (error) {
      const chatError = {
        code: ErrorCode.UNKOWN_ERROR,
        name: 'Error',
        message: 'Failed to send message. Please try again.'
      }
      
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === loadingMessage.id
            ? {
                ...msg,
                error: chatError,
                loading: false,
              }
            : msg
        )
      )
    }
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      <ChatHeader 
        title="ChatVerse"
        subtitle="AI Assistant"
        onBack={() => navigate({ to: '/' })}
      />
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <ChatMessageCard key={message.id} message={message} />
        ))}
      </div>
      <ChatInput
        onSend={handleSend}
        placeholder="Type a message..."
      />
    </div>
  )
}

export default MultiBotChatPanel