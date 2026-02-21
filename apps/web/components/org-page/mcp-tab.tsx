'use client'

import { Check, Copy, Keyboard } from 'lucide-react'
import { type ReactNode, useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

const MCP_CONFIG = `{
  "mcpServers": {
    "plexaris": {
      "url": "https://mcp.plexaris.com"
    }
  }
}`

function OpenAIIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      fill="currentColor"
      className={className}
    >
      <path d="M14.949 6.547a3.94 3.94 0 0 0-.348-3.273 4.11 4.11 0 0 0-4.4-1.934A4.1 4.1 0 0 0 8.423.2 4.15 4.15 0 0 0 6.305.086a4.1 4.1 0 0 0-1.891.948 4.04 4.04 0 0 0-1.158 1.753 4.1 4.1 0 0 0-1.563.679A4 4 0 0 0 .554 4.72a3.99 3.99 0 0 0 .502 4.731 3.94 3.94 0 0 0 .346 3.274 4.11 4.11 0 0 0 4.402 1.933c.382.425.852.764 1.377.995.526.231 1.095.35 1.67.346 1.78.002 3.358-1.132 3.901-2.804a4.1 4.1 0 0 0 1.563-.68 4 4 0 0 0 1.14-1.253 3.99 3.99 0 0 0-.506-4.716m-6.097 8.406a3.05 3.05 0 0 1-1.945-.694l.096-.054 3.23-1.838a.53.53 0 0 0 .265-.455v-4.49l1.366.778q.02.011.025.035v3.722c-.003 1.653-1.361 2.992-3.037 2.996m-6.53-2.75a2.95 2.95 0 0 1-.36-2.01l.095.057L5.29 12.09a.53.53 0 0 0 .527 0l3.949-2.246v1.555a.05.05 0 0 1-.022.041L6.473 13.3c-1.454.826-3.311.335-4.15-1.098m-.85-6.94A3.02 3.02 0 0 1 3.07 3.949v3.785a.51.51 0 0 0 .262.451l3.93 2.237-1.366.779a.05.05 0 0 1-.048 0L2.585 9.342a2.98 2.98 0 0 1-1.113-4.094zm11.216 2.571L8.747 5.576l1.362-.776a.05.05 0 0 1 .048 0l3.265 1.86a3 3 0 0 1 1.173 1.207 2.96 2.96 0 0 1-.27 3.2 3.05 3.05 0 0 1-1.36.997V8.279a.52.52 0 0 0-.276-.445m1.36-2.015-.097-.057-3.226-1.855a.53.53 0 0 0-.53 0L6.249 6.153V4.598a.04.04 0 0 1 .019-.04L9.533 2.7a3.07 3.07 0 0 1 3.257.139c.474.325.843.778 1.066 1.303.223.526.289 1.103.191 1.664zM5.503 8.575 4.139 7.8a.05.05 0 0 1-.026-.037V4.049c0-.57.166-1.127.476-1.607s.752-.864 1.275-1.105a3.08 3.08 0 0 1 3.234.41l-.096.054-3.23 1.838a.53.53 0 0 0-.265.455zm.742-1.577 1.758-1 1.762 1v2l-1.755 1-1.762-1z" />
    </svg>
  )
}

function ClaudeIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      fill="currentColor"
      className={className}
    >
      <path d="m3.127 10.604 3.135-1.76.053-.153-.053-.085H6.11l-.525-.032-1.791-.048-1.554-.065-1.505-.08-.38-.081L0 7.832l.036-.234.32-.214.455.04 1.009.069 1.513.105 1.097.064 1.626.17h.259l.036-.105-.089-.065-.068-.064-1.566-1.062-1.695-1.121-.887-.646-.48-.327-.243-.306-.104-.67.435-.48.585.04.15.04.593.456 1.267.981 1.654 1.218.242.202.097-.068.012-.049-.109-.181-.9-1.626-.96-1.655-.428-.686-.113-.411a2 2 0 0 1-.068-.484l.496-.674L4.446 0l.662.089.279.242.411.94.666 1.48 1.033 2.014.302.597.162.553.06.17h.105v-.097l.085-1.134.157-1.392.154-1.792.052-.504.25-.605.497-.327.387.186.319.456-.045.294-.19 1.23-.37 1.93-.243 1.29h.142l.161-.16.654-.868 1.097-1.372.484-.545.565-.601.363-.287h.686l.505.751-.226.775-.707.895-.585.759-.839 1.13-.524.904.048.072.125-.012 1.897-.403 1.024-.186 1.223-.21.553.258.06.263-.218.536-1.307.323-1.533.307-2.284.54-.028.02.032.04 1.029.098.44.024h1.077l2.005.15.525.346.315.424-.053.323-.807.411-3.631-.863-.872-.218h-.12v.073l.726.71 1.331 1.202 1.667 1.55.084.383-.214.302-.226-.032-1.464-1.101-.565-.497-1.28-1.077h-.084v.113l.295.432 1.557 2.34.08.718-.112.234-.404.141-.444-.08-.911-1.28-.94-1.44-.759-1.291-.093.053-.448 4.821-.21.246-.484.186-.403-.307-.214-.496.214-.98.258-1.28.21-1.016.19-1.263.112-.42-.008-.028-.092.012-.953 1.307-1.448 1.957-1.146 1.227-.274.109-.477-.247.045-.44.266-.39 1.586-2.018.956-1.25.617-.723-.004-.105h-.036l-4.212 2.736-.75.096-.324-.302.04-.496.154-.162 1.267-.871z" />
    </svg>
  )
}

function GeminiIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      fill="currentColor"
      className={className}
    >
      <path d="M15.545 6.558a9.4 9.4 0 0 1 .139 1.626c0 2.434-.87 4.492-2.384 5.885h.002C11.978 15.292 10.158 16 8 16A8 8 0 1 1 8 0a7.7 7.7 0 0 1 5.352 2.082l-2.284 2.284A4.35 4.35 0 0 0 8 3.166c-2.087 0-3.86 1.408-4.492 3.304a4.8 4.8 0 0 0 0 3.063h.003c.635 1.893 2.405 3.301 4.492 3.301 1.078 0 2.004-.276 2.722-.764h-.003a3.7 3.7 0 0 0 1.599-2.431H8v-3.08z" />
    </svg>
  )
}

const CHAT_PROMPTS = [
  {
    text: 'What is my top selling product this month?',
    emoji: '🐢',
    position: 'top-[18%] left-[15%] -rotate-3',
  },
  {
    text: 'Update the price of our bakery items +10%',
    emoji: '🐙',
    position: 'top-[22%] right-[12%] rotate-2',
  },
  {
    text: 'What is the status of my open orders?',
    emoji: '🐕',
    position: 'bottom-[22%] left-[12%] rotate-1',
  },
  {
    text: 'When was the last time we ordered beverages?',
    emoji: '🐈',
    position: 'bottom-[18%] right-[15%] -rotate-2',
  },
  {
    text: 'Show me revenue trends for the last 3 months',
    emoji: '🐟',
    position: 'top-[42%] left-[8%] -rotate-1',
  },
  {
    text: 'Which suppliers have late deliveries this week?',
    emoji: '🦊',
    position: 'top-[45%] right-[8%] rotate-1',
  },
]

function ChatBubble({
  text,
  emoji,
  position,
}: {
  text: string
  emoji: string
  position: string
}) {
  return (
    <div
      className={`absolute ${position} z-10 flex max-w-[260px] items-start gap-2.5`}
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border/40 bg-muted/60 text-base">
        {emoji}
      </div>
      <div className="rounded-2xl rounded-tl-sm border border-border/40 bg-card/70 px-3.5 py-2.5 text-sm text-muted-foreground shadow-sm backdrop-blur-sm">
        {text}
      </div>
    </div>
  )
}

const INTEGRATIONS: { name: string; icon: ReactNode; url: string }[] = [
  {
    name: 'OpenAI',
    icon: <OpenAIIcon className="h-5 w-5" />,
    url: 'https://platform.openai.com/docs/guides/tools-mcp',
  },
  {
    name: 'Claude',
    icon: <ClaudeIcon className="h-5 w-5" />,
    url: 'https://docs.anthropic.com/en/docs/agents-and-tools/mcp',
  },
  {
    name: 'Gemini',
    icon: <GeminiIcon className="h-5 w-5" />,
    url: 'https://ai.google.dev/gemini-api/docs/mcp',
  },
  {
    name: 'TypingMind',
    icon: <Keyboard className="h-5 w-5" />,
    url: 'https://docs.typingmind.com/plugins/mcp-servers',
  },
]

interface McpTabProps {
  organizationId?: string
}

export function McpTab(_props: McpTabProps) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    void navigator.clipboard.writeText(MCP_CONFIG)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative flex min-h-[calc(100vh-8rem)] items-center justify-center overflow-hidden">
      {/* Background pattern with edge fade */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          maskImage:
            'radial-gradient(ellipse at center, black 40%, transparent 80%)',
          WebkitMaskImage:
            'radial-gradient(ellipse at center, black 40%, transparent 80%)',
        }}
      >
        {/* Gradient base */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/15 via-transparent to-cyan-500/15" />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(128,128,128,1) 1px, transparent 1px), linear-gradient(90deg, rgba(128,128,128,1) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        {/* Animated glowing orbs */}
        <div className="absolute left-1/4 top-1/4 h-64 w-64 animate-pulse rounded-full bg-violet-500/20 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-64 w-64 animate-pulse rounded-full bg-cyan-500/20 blur-3xl [animation-delay:1s]" />
        {/* Connection lines */}
        <svg className="absolute inset-0 h-full w-full opacity-[0.1]">
          <line
            x1="10%"
            y1="20%"
            x2="90%"
            y2="80%"
            stroke="currentColor"
            strokeWidth="1"
            strokeDasharray="8 8"
          />
          <line
            x1="90%"
            y1="20%"
            x2="10%"
            y2="80%"
            stroke="currentColor"
            strokeWidth="1"
            strokeDasharray="8 8"
          />
          <line
            x1="50%"
            y1="0%"
            x2="50%"
            y2="100%"
            stroke="currentColor"
            strokeWidth="1"
            strokeDasharray="8 8"
          />
        </svg>
      </div>

      {/* Chat bubbles around the card */}
      {CHAT_PROMPTS.map((prompt) => (
        <ChatBubble
          key={prompt.text}
          text={prompt.text}
          emoji={prompt.emoji}
          position={prompt.position}
        />
      ))}

      {/* Coming soon pill + blurred card */}
      <div className="relative z-10 flex w-full max-w-lg flex-col items-center">
        <span className="mb-4 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-sm font-medium text-violet-400">
          Coming soon
        </span>
        <div className="pointer-events-none w-full select-none blur-[6px]">
          <Card className="w-full border-border/50 bg-card/80 shadow-2xl backdrop-blur-sm">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold tracking-tight">
                Connect to Plexaris MCP
              </CardTitle>
              <CardDescription className="text-base">
                Add the following configuration to your AI client to get started
                with MCP integration.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* JSON config block */}
              <div className="group relative">
                <div className="overflow-hidden rounded-lg border border-border/50 bg-zinc-950 font-mono text-sm dark:bg-zinc-900">
                  <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
                    <span className="text-xs text-zinc-400">mcp.json</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopy}
                      className="h-7 gap-1.5 px-2 text-xs text-zinc-400 hover:text-zinc-100"
                    >
                      {copied ? (
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                      {copied ? 'Copied' : 'Copy'}
                    </Button>
                  </div>
                  <pre className="overflow-x-auto p-4 text-[13px] leading-relaxed">
                    <code>
                      <span className="text-zinc-100">{'{'}</span>
                      {'\n'}
                      <span className="text-zinc-100">{'  '}</span>
                      <span className="text-violet-400">{'"mcpServers"'}</span>
                      <span className="text-zinc-100">{': {'}</span>
                      {'\n'}
                      <span className="text-zinc-100">{'    '}</span>
                      <span className="text-cyan-400">{'"plexaris"'}</span>
                      <span className="text-zinc-100">{': {'}</span>
                      {'\n'}
                      <span className="text-zinc-100">{'      '}</span>
                      <span className="text-emerald-400">{'"url"'}</span>
                      <span className="text-zinc-100">{': '}</span>
                      <span className="text-amber-300">
                        {'"https://mcp.plexaris.com"'}
                      </span>
                      {'\n'}
                      <span className="text-zinc-100">{'    }'}</span>
                      {'\n'}
                      <span className="text-zinc-100">{'  }'}</span>
                      {'\n'}
                      <span className="text-zinc-100">{'}'}</span>
                    </code>
                  </pre>
                </div>
              </div>

              {/* Connect buttons */}
              <div className="space-y-3">
                <p className="text-center text-sm font-medium text-muted-foreground">
                  Connect to
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {INTEGRATIONS.map((integration) => (
                    <Button
                      key={integration.name}
                      variant="outline"
                      className="h-12 gap-2.5 text-sm font-medium"
                      asChild
                    >
                      <a
                        href={integration.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {integration.icon}
                        {integration.name}
                      </a>
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
