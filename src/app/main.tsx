import React from 'react'
import { RouterProvider } from '@tanstack/react-router'
import { createRoot } from 'react-dom/client'
import '../services/sentry'
import './base.scss'
import './i18n'
import { plausible } from './plausible'
import { router } from './router'

console.log('Main.tsx: Starting app initialization')

const container = document.getElementById('app')
if (!container) {
  console.error('Main.tsx: Could not find app container element')
} else {
  console.log('Main.tsx: Found app container, creating root')
  const root = createRoot(container)
  console.log('Main.tsx: Rendering app')
  root.render(
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
  )
  console.log('Main.tsx: App rendered')
}

plausible.enableAutoPageviews()