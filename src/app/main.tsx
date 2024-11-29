import React from 'react'
import { RouterProvider } from '@tanstack/react-router'
import { createRoot } from 'react-dom/client'
import '../services/sentry'
import './base.scss'
import './i18n'
import { plausible } from './plausible'
import { router } from './router'

const container = document.getElementById('app')!
const root = createRoot(container)
root.render(
  React.createElement(React.StrictMode, null,
    React.createElement(RouterProvider, { router })
  )
)

plausible.enableAutoPageviews()