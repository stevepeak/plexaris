'use client'

import { MessageSquare, Send } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const ASSISTANT_REPLIES = [
  "Got it! I'll add that to your order.",
  'Sure thing — anything else you need?',
  "Good choice! I've noted that down.",
  'Let me check on that for you.',
  'Added! Want to review your order?',
]

function pickReply(index: number) {
  return ASSISTANT_REPLIES[index % ASSISTANT_REPLIES.length]!
}

interface OrderChatProps {
  initialMessages?: ChatMessage[]
}

export function OrderChat({ initialMessages = [] }: OrderChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [input, setInput] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)
  const replyCount = useRef(0)

  const scrollToBottom = useCallback(() => {
    const el = scrollRef.current
    if (el) {
      // ScrollArea renders a viewport div as first child
      const viewport = el.querySelector('[data-radix-scroll-area-viewport]')
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight
      }
    }
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  const sendMessage = useCallback(() => {
    const text = input.trim()
    if (!text) return

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMsg])
    setInput('')

    const replyIndex = replyCount.current++
    setTimeout(() => {
      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: pickReply(replyIndex),
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMsg])
    }, 800)
  }, [input])

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b px-4 py-3">
        <MessageSquare className="h-5 w-5 text-muted-foreground" />
        <h2 className="font-semibold">Chat</h2>
      </div>

      <ScrollArea ref={scrollRef} className="flex-1">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center p-4">
            <p className="text-sm text-muted-foreground">
              Chat with the assistant to build your order.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 p-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  'flex',
                  msg.role === 'user' ? 'justify-end' : 'justify-start',
                )}
              >
                <div
                  className={cn(
                    'max-w-[80%] rounded-lg px-3 py-2 text-sm',
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted',
                  )}
                >
                  {msg.content}
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      <div className="border-t px-3 py-2">
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            sendMessage()
          }}
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message…"
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={!input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}
