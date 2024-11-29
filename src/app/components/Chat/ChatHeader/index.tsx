import React, { FC } from 'react'
import { Link } from '@tanstack/react-router'
import { IoArrowBack, IoEllipsisVertical } from 'react-icons/io5'
import { cx } from '~/utils'

interface Props {
  title: string
  subtitle?: string
  onBack?: () => void
  onOpenMenu?: () => void
  className?: string
}

const ChatHeader: FC<Props> = ({ title, subtitle, onBack, onOpenMenu, className }) => {
  return (
    <header
      className={cx(
        'flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700',
        className,
      )}
    >
      <div className="flex items-center gap-3">
        {onBack && (
          <button
            onClick={onBack}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Go back"
          >
            <IoArrowBack className="w-5 h-5" />
          </button>
        )}
        <div className="flex flex-col">
          <h1 className="text-lg font-semibold">{title}</h1>
          {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>}
        </div>
      </div>
      {onOpenMenu && (
        <button
          onClick={onOpenMenu}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          aria-label="Open menu"
        >
          <IoEllipsisVertical className="w-5 h-5" />
        </button>
      )}
    </header>
  )
}

export default ChatHeader
