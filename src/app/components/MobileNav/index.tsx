import React, { FC, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { IoMenu, IoClose } from 'react-icons/io5'
import { cx } from '~/utils'
import MobileDrawer from '../MobileDrawer'
import logo from '~/assets/santa-logo.png'

interface Props {
  className?: string
}

const MobileNav: FC<Props> = ({ className }) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <nav className={cx('flex items-center justify-between p-4 sm:hidden', className)}>
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="Logo" className="h-8 w-8" />
          <span className="text-lg font-semibold">ChatVerse</span>
        </Link>
        <button
          onClick={() => setIsOpen(true)}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          aria-label="Open menu"
        >
          <IoMenu className="h-6 w-6" />
        </button>
      </nav>

      <MobileDrawer isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Menu</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Close menu"
          >
            <IoClose className="h-6 w-6" />
          </button>
        </div>
        <div className="flex flex-col gap-4">
          <Link
            to="/"
            className="px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={() => setIsOpen(false)}
          >
            Home
          </Link>
          <Link
            to="/chat"
            className="px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={() => setIsOpen(false)}
          >
            Chat
          </Link>
          <Link
            to="/settings"
            className="px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={() => setIsOpen(false)}
          >
            Settings
          </Link>
        </div>
      </MobileDrawer>
    </>
  )
}

export default MobileNav
