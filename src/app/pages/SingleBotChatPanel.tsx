import { FC } from 'react'
import { useChat } from '~app/hooks/use-chat'
import { BotId, createBotInstance } from '../bots'
import ConversationPanel from '../components/Chat/ConversationPanel'

interface Props {
  botId: BotId
}

const SingleBotChatPanel: FC<Props> = ({ botId }) => {
  const chat = useChat()
  const bot = createBotInstance(botId)

  return (
    <div className="overflow-hidden h-full">
      <ConversationPanel
        botId={botId}
        bot={bot}
        messages={chat.messages}
        onUserSendMessage={chat.handleUserSendMessage}
        generating={chat.generating || false}
        stopGenerating={chat.stopGenerating}
        resetConversation={chat.resetChat}
      />
    </div>
  )
}

export default SingleBotChatPanel