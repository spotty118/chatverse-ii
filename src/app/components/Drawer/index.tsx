import React, { FC, ReactNode, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { cx } from '~/utils'

interface Props {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  position?: 'left' | 'right' | 'bottom'
  className?: string
}

const Drawer: FC<Props> = ({ isOpen, onClose, children, position = 'left', className }) => {
  const drawerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const positionClasses = {
    left: 'left-0 top-0 h-full',
    right: 'right-0 top-0 h-full',
    bottom: 'bottom-0 left-0 w-full',
  }

  const transformClasses = {
    left: 'translate-x-[-100%]',
    right: 'translate-x-[100%]',
    bottom: 'translate-y-[100%]',
  }

  const portalContent: React.ReactElement = (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50">
      <div
        ref={drawerRef}
        className={cx(
          'fixed bg-white dark:bg-gray-800 shadow-lg transition-transform duration-300 ease-in-out',
          positionClasses[position],
          isOpen ? 'translate-x-0 translate-y-0' : transformClasses[position],
          className,
        )}
      >
        {children}
      </div>
    </div>
  )

  return createPortal(portalContent, document.body)
}

export default Drawer