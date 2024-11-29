import React, { FC, ReactNode } from 'react'
import { cx } from '~/utils'
import Drawer from '../Drawer'

interface Props {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  className?: string
}

const MobileDrawer: FC<Props> = ({ isOpen, onClose, children, className }) => {
  return (
    <Drawer isOpen={isOpen} onClose={onClose} position="bottom" className={cx('p-4 rounded-t-2xl', className)}>
      {children}
    </Drawer>
  )
}

export default MobileDrawer
