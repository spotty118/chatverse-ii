import React, { FC, useState, useRef, useEffect } from 'react'
import { IoSend, IoImage } from 'react-icons/io5'
import { cx } from '~/utils'

interface Props {
  onSend: (message: string) => void
  onImageUpload?: (file: File) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

const ChatInput: FC<Props> = ({ onSend, onImageUpload, placeholder = 'Type a message...', disabled, className }) => {
  const [message, setMessage] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = () => {
    const trimmedMessage = message.trim()
    if (trimmedMessage && !disabled) {
      onSend(trimmedMessage)
      setMessage('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && onImageUpload) {
      onImageUpload(file)
    }
  }

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px'
    }
  }, [message])

  return (
    <div className={cx('flex items-end gap-2 bg-white dark:bg-gray-800 p-4 border-t', className)}>
      {onImageUpload && (
        <>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            disabled={disabled}
            aria-label="Upload image"
          >
            <IoImage className="w-5 h-5" />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            className="hidden"
            disabled={disabled}
          />
        </>
      )}
      <div className="flex-1 relative">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full resize-none rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent px-4 py-2 pr-12 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400"
          rows={1}
        />
        <button
          onClick={handleSubmit}
          disabled={!message.trim() || disabled}
          className={cx(
            'absolute right-2 bottom-2 p-2 rounded-lg transition-colors',
            message.trim() && !disabled
              ? 'text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900'
              : 'text-gray-400 cursor-not-allowed',
          )}
          aria-label="Send message"
        >
          <IoSend className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}

export default ChatInput
