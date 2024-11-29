import { FC } from 'react'
import { ChatMessageModel } from '~/types'

const ChatMessages: FC = () => {
  return (
    <div className="space-y-4">
      {/* Messages will be implemented in next step */}
      <div className="text-center text-muted">
        Start a conversation by sending a message below
      </div>
    </div>
  )
}

export default ChatMessages