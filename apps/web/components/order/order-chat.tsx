'use client'

import { MessageSquare } from 'lucide-react'

export function OrderChat() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b px-4 py-3">
        <MessageSquare className="h-5 w-5 text-muted-foreground" />
        <h2 className="font-semibold">Chat</h2>
      </div>

      <div className="flex flex-1 items-center justify-center p-4">
        <p className="text-sm text-muted-foreground">
          Chat with the assistant to build your order.
        </p>
      </div>
    </div>
  )
}
