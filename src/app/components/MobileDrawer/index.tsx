import React, { FC, ReactNode } from 'react'
import { cx } from '~/utils'

interface Props {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  className?: string
}

const MobileDrawer: FC<Props> = ({ isOpen, onClose, children, className }) => {
  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
          <div
            className={cx(
              'absolute bottom-0 w-full bg-white dark:bg-gray-800 rounded-t-xl p-4 transform transition-transform duration-300 ease-in-out',
              isOpen ? 'translate-y-0' : 'translate-y-full',
              className,
            )}
          >
            {children}
          </div>
        </div>
      )}
    </>
  )
}

export default MobileDrawer
