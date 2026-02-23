'use client'

import { MessageSquare } from 'lucide-react'

import { Kbd } from '@/components/kbd'

const EXAMPLE_PROMPTS = [
  {
    role: 'user' as const,
    text: 'Show me the most popular bread',
  },
  {
    role: 'assistant' as const,
    text: 'Your top seller this week is the sourdough boule — 34 units sold!',
  },
  {
    role: 'user' as const,
    text: 'What items have the best promotions?',
  },
  {
    role: 'assistant' as const,
    text: 'Right now the organic oat milk is 20% off and the almond butter has a buy-2-get-1 deal.',
  },
  {
    role: 'user' as const,
    text: 'Add 5 cases of oat milk to my order',
  },
]

export function OrderChat() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b px-4 py-3">
        <MessageSquare className="h-5 w-5 text-muted-foreground" />
        <h2 className="font-semibold">Chat</h2>
        <Kbd>c</Kbd>
      </div>

      <div className="relative flex flex-1 flex-col">
        {/* Example chat bubbles */}
        <div className="flex flex-1 flex-col gap-3 p-4 opacity-50">
          {EXAMPLE_PROMPTS.map((msg) => (
            <div
              key={msg.text}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        {/* Coming soon overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-[2px]">
          <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-sm font-medium text-violet-400">
            Coming soon
          </span>
        </div>
      </div>
    </div>
  )
}
