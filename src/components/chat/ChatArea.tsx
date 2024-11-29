import { FC } from 'react'
import ChatMessages from './ChatMessages'
import ChatInput from './ChatInput'

const ChatArea: FC = () => {
  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-border p-4">
        <h2 className="text-lg font-semibold">Chat</h2>
      </div>
      
      <div className="flex-1 overflow-auto p-4">
        <ChatMessages />
      </div>
      
      <div className="border-t border-border p-4">
        <ChatInput />
      </div>
    </div>
  )
}

export default ChatArea