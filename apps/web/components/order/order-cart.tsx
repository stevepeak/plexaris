'use client'

import { ShoppingCart } from 'lucide-react'

import { Button } from '@/components/ui/button'

export function OrderCart() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b px-4 py-3">
        <ShoppingCart className="h-5 w-5 text-muted-foreground" />
        <h2 className="font-semibold">Your Order</h2>
      </div>

      <div className="flex flex-1 items-center justify-center p-4">
        <p className="text-sm text-muted-foreground">
          Your cart is empty. Browse categories or ask the assistant to add
          items.
        </p>
      </div>

      <div className="border-t px-4 py-3">
        <Button className="w-full" disabled>
          Checkout
        </Button>
      </div>
    </div>
  )
}
