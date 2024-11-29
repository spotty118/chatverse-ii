import { FC } from 'react'
import { MessageSquare, Settings } from 'lucide-react'
import ChatSidebar from './ChatSidebar'
import ChatArea from './ChatArea'

const ChatLayout: FC = () => {
  return (
    <div className="flex h-screen bg-background">
      <ChatSidebar />
      <main className="flex-1 overflow-hidden">
        <ChatArea />
      </main>
    </div>
  )
}

export default ChatLayout