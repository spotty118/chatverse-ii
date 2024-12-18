import React from 'react'
import { createRoot } from 'react-dom/client'
import SidePanelPage from './pages/SidePanelPage'

const container = document.getElementById('app')!
const root = createRoot(container)
root.render(
  React.createElement(React.StrictMode, null,
    React.createElement(SidePanelPage)
  )
)