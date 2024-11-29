import { FC, useState } from 'react'
import { MessageSquare } from 'lucide-react'

const ChatInput: FC = () => {
  const [message, setMessage] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return
    
    // Message handling will be implemented in next step
    console.log('Sending message:', message)
    setMessage('')
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center space-x-2">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message..."
        className="flex-1 p-2 rounded-md border border-border bg-input focus:outline-none focus:ring-2 focus:ring-primary"
      />
      <button
        type="submit"
        className="p-2 rounded-md bg-primary text-white hover:bg-primary-hover transition-colors"
      >
        <MessageSquare className="w-5 h-5" />
      </button>
    </form>
  )
}

export default ChatInput