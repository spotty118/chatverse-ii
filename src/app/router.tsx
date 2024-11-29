import { createHashHistory, createRootRoute, createRoute, createRouter, useParams } from '@tanstack/react-router'
import { BotId } from './bots'
import Layout from './components/Layout'
import MultiBotChatPanel from './pages/MultiBotChatPanel'
import PremiumPage from './pages/PremiumPage'
import SettingPage from './pages/SettingPage'
import SingleBotChatPanel from './pages/SingleBotChatPanel'

const rootRoute = createRootRoute({
  component: Layout,
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: MultiBotChatPanel,
})

function ChatRoute() {
  const { botId } = useParams({ from: chatRoute.id })
  return <SingleBotChatPanel botId={botId as BotId} />
}

const chatRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'chat/$botId',
  component: ChatRoute,
})

const settingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'setting',
  component: SettingPage,
})

const premiumRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'premium',
  component: PremiumPage,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      source: search.source as string | undefined,
    }
  },
})

const routeTree = rootRoute.addChildren([indexRoute, chatRoute, settingRoute, premiumRoute])

const hashHistory = createHashHistory()
const router = createRouter({ routeTree, history: hashHistory })

export { router, premiumRoute }