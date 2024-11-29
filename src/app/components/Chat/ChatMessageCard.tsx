import { cx } from '~/utils'
import React, { FC, memo, useEffect, useMemo, useState } from 'react'
import { IoCheckmarkSharp, IoCopyOutline } from 'react-icons/io5'
import { BeatLoader } from 'react-spinners'
import { ChatMessageModel } from '~/types'
import Markdown from '../Markdown'
import ErrorAction from './ErrorAction'

const COPY_ICON_CLASS = 'self-top cursor-pointer invisible group-hover:visible mt-[12px] text-primary-text'

interface Props {
  message: ChatMessageModel
  className?: string
}

const ChatMessageCard: FC<Props> = ({ message, className }) => {
  const [copied, setCopied] = useState(false)

  const imageUrl = useMemo(() => {
    return message.image ? URL.createObjectURL(message.image) : ''
  }, [message.image])

  const copyText = useMemo(() => {
    if (message.text) {
      return message.text
    }
    if (message.error) {
      return message.error.message
    }
    return ''
  }, [message.error, message.text])

  useEffect(() => {
    if (copied) {
      setTimeout(() => setCopied(false), 1000)
    }
  }, [copied])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(copyText)
      setCopied(true)
    } catch (err) {
      console.error('Failed to copy text:', err)
    }
  }

  return (
    <div 
      className={cx(
        'group flex gap-3 w-full animate-[fadeIn_0.3s_ease-in-out]',
        message.author === 'user' ? 'flex-row-reverse' : 'flex-row',
        className
      )}
    >
      <div className="flex flex-col w-11/12 max-w-fit items-start gap-2">
        <div
          className={cx(
            'px-4 py-2 rounded-lg',
            message.author === 'user'
              ? 'bg-blue-500 text-white dark:bg-blue-600'
              : 'bg-gray-100 dark:bg-gray-800'
          )}
        >
          {!!imageUrl && <img src={imageUrl} className="max-w-xs my-2" alt="Message attachment" />}
          {message.text ? (
            <Markdown>{message.text}</Markdown>
          ) : (
            !message.error && <div className="flex items-center justify-center h-6">
              <BeatLoader size={8} color="currentColor" />
            </div>
          )}
          {!!message.error && <p className="text-[#cc0000] dark:text-[#ff0033]">{message.error.message}</p>}
        </div>
        {!!message.error && <ErrorAction error={message.error} />}
      </div>
      {!!copyText && (
        <div
          role="button"
          tabIndex={0}
          className={cx(
            COPY_ICON_CLASS,
            'opacity-0 group-hover:opacity-100 transition-opacity duration-200'
          )}
          onClick={handleCopy}
        >
          {copied ? <IoCheckmarkSharp size={16} /> : <IoCopyOutline size={16} />}
        </div>
      )}
    </div>
  )
}

export default memo(ChatMessageCard)