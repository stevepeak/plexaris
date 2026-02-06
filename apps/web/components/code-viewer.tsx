'use client'

import { Check, Copy } from 'lucide-react'
import { useEffect, useState } from 'react'
import { codeToHtml } from 'shiki'

import { cn } from '@/lib/utils'

import { Button } from './ui/button'

interface CodeViewerProps {
  /** The code to display. If an object, it will be JSON stringified. */
  code: string | object
  /** The language for syntax highlighting. Defaults to 'json'. */
  language?: string
  /** Optional title shown above the code block. */
  title?: string
  /** Additional className for the container. */
  className?: string
  /** Maximum height before scrolling. Defaults to 400px. */
  maxHeight?: number
}

export function CodeViewer({
  code,
  language = 'json',
  title,
  className,
  maxHeight = 400,
}: CodeViewerProps) {
  const [html, setHtml] = useState<string>('')
  const [copied, setCopied] = useState(false)

  const codeString =
    typeof code === 'string' ? code : JSON.stringify(code, null, 2)

  useEffect(() => {
    let cancelled = false

    async function highlight() {
      try {
        const result = await codeToHtml(codeString, {
          lang: language,
          theme: 'github-dark',
        })
        if (!cancelled) {
          setHtml(result)
        }
      } catch {
        // Fallback to plain text if highlighting fails
        if (!cancelled) {
          setHtml(
            `<pre class="shiki"><code>${escapeHtml(codeString)}</code></pre>`,
          )
        }
      }
    }

    void highlight()

    return () => {
      cancelled = true
    }
  }, [codeString, language])

  const handleCopy = async () => {
    await navigator.clipboard.writeText(codeString)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      className={cn(
        'overflow-hidden rounded-lg border bg-[#0d1117]',
        className,
      )}
    >
      {title && (
        <div className="flex items-center justify-between border-b border-[#30363d] bg-[#161b22] px-4 py-2">
          <span className="text-sm font-medium text-[#c9d1d9]">{title}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-7 px-2 text-[#8b949e] hover:bg-[#30363d] hover:text-[#c9d1d9]"
          >
            {copied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
      )}
      {!title && (
        <div className="absolute right-2 top-2 z-10">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-7 px-2 text-[#8b949e] hover:bg-[#30363d] hover:text-[#c9d1d9]"
          >
            {copied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
      )}
      <div
        className="overflow-auto p-4 text-sm"
        style={{ maxHeight: `${maxHeight}px` }}
      >
        {html ? (
          <div
            className="[&_pre]:!m-0 [&_pre]:!bg-transparent [&_pre]:!p-0"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        ) : (
          <pre className="text-[#c9d1d9]">
            <code>{codeString}</code>
          </pre>
        )}
      </div>
    </div>
  )
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
