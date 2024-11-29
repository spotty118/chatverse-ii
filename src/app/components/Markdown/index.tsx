import { cx } from '~/utils'
import 'github-markdown-css'
import React, { FC, ReactNode, useEffect, useMemo, useState } from 'react'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { BsClipboard } from 'react-icons/bs'
import ReactMarkdown from 'react-markdown'
import reactNodeToString from 'react-node-to-string'
import rehypeHighlight from 'rehype-highlight'
import remarkBreaks from 'remark-breaks'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import supersub from 'remark-supersub'
import Tooltip from '../Tooltip'
import './markdown.css'

interface CustomCodeProps {
  children: ReactNode
  className?: string
}

function CustomCode({ children, className }: CustomCodeProps) {
  const [copied, setCopied] = useState(false)
  const code = useMemo(() => reactNodeToString(children), [children])

  useEffect(() => {
    if (copied) {
      setTimeout(() => setCopied(false), 1000)
    }
  }, [copied])

  return (
    <div className="flex flex-col">
      <div className="bg-[#e6e7e8] dark:bg-[#444a5354] text-xs p-2">
        <CopyToClipboard text={code} onCopy={() => setCopied(true)}>
          {React.createElement(
            () => (
              <div className="cursor-pointer" onClick={() => {}}>
                {copied ? (
                  <div className="flex flex-row items-center gap-2 w-fit ml-1">
                    <BsClipboard />
                    <span>copied</span>
                  </div>
                ) : (
                  <div className="flex flex-row items-center gap-2 w-fit ml-1">
                    <BsClipboard />
                    <span>copy code</span>
                  </div>
                )}
              </div>
            )
          )}
        </CopyToClipboard>
      </div>
      <code className={cx(className, 'px-4')}>{children}</code>
    </div>
  )
}

const Markdown: FC<{ children: string }> = ({ children }) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkMath, supersub, remarkBreaks, remarkGfm]}
      rehypePlugins={[[rehypeHighlight, { detect: true, ignoreMissing: true }]]}
      className="markdown-body markdown-custom-styles !text-base font-normal"
      linkTarget="_blank"
      components={{
        a: ({ node, ...props }) => {
          if (!props.title) {
            return <a {...props} />
          }
          return (
            <Tooltip content={props.title}>
              <a {...props} title={undefined} />
            </Tooltip>
          )
        },
        code: ({ node, inline, className, children, ...props }) => {
          if (inline) {
            return (
              <code className={className} {...props}>
                {children}
              </code>
            )
          }
          return <CustomCode className={className}>{children}</CustomCode>
        },
      }}
    >
      {children}
    </ReactMarkdown>
  )
}

export default Markdown