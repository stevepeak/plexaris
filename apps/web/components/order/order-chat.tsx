'use client'

import { Bot, Send } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function OrderChat() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b px-4 py-3">
        <Bot className="h-5 w-5 text-muted-foreground" />
        <h2 className="font-semibold">Order Assistant</h2>
      </div>

      <div className="flex flex-1 items-center justify-center p-4">
        <p className="text-sm text-muted-foreground">
          Ask about products, prices, or place an order...
        </p>
      </div>

      <div className="flex items-center gap-2 border-t px-4 py-3">
        <Input placeholder="Type a message..." className="flex-1" disabled />
        <Button size="icon" disabled>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
