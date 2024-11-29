import React, { FC } from 'react'
import { IoMoon, IoSunny } from 'react-icons/io5'

interface Props {
  isDark: boolean
  onChange: (isDark: boolean) => void
}

const ThemeToggle: FC<Props> = ({ isDark, onChange }) => {
  const toggleTheme = () => {
    const newTheme = !isDark
    document.documentElement.classList.toggle('dark', newTheme)
    document.documentElement.classList.toggle('light', !newTheme)
    onChange(newTheme)
  }

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      aria-label="Toggle theme"
    >
      {isDark ? <IoSunny className="w-5 h-5" /> : <IoMoon className="w-5 h-5" />}
    </button>
  )
}

export default ThemeToggle
