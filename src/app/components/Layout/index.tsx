import React from 'react'
import { Outlet } from '@tanstack/react-router'
import Sidebar from '../Sidebar'
import MobileNav from '../MobileNav'

const Layout = () => {
  return (
    <div className="flex h-screen flex-col overflow-hidden sm:bg-[#7EB8D6FF]">
      <MobileNav className="sm:hidden" />
      <main className="grid flex-1 grid-cols-1 overflow-hidden sm:grid-cols-[auto_1fr]">
        <Sidebar />
        <div className="flex flex-col bg-white dark:bg-gray-900">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default Layout
