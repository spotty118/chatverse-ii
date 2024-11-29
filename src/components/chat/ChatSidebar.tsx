import { FC } from 'react'
import { MessageSquare, Settings } from 'lucide-react'
import { CHATBOTS } from '~/app/consts'

const ChatSidebar: FC = () => {
  return (
    <div className="w-64 border-r border-border bg-sidebar-bg p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">ChatHub</h1>
        <Settings className="w-5 h-5 text-muted cursor-pointer" />
      </div>
      
      <div className="space-y-2">
        {Object.entries(CHATBOTS).map(([id, bot]) => (
          <button
            key={id}
            className="flex items-center space-x-3 w-full p-2 rounded-lg hover:bg-model-hover transition-colors"
          >
            <img src={bot.avatar} alt={bot.name} className="w-6 h-6 rounded-full" />
            <span className="text-sm">{bot.name}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default ChatSidebar