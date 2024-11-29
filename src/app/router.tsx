import { createHashHistory, createRootRoute, createRoute, createRouter } from '@tanstack/react-router'
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

const chatRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'chat/$botId',
  component: SingleBotChatPanel,
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
})

const routeTree = rootRoute.addChildren([indexRoute, chatRoute, settingRoute, premiumRoute])

const hashHistory = createHashHistory()
const router = createRouter({ routeTree, history: hashHistory })

export { router, premiumRoute }