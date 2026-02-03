'use client'

import { Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react'
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

interface CartItem {
  id: string
  name: string
  price: number
  unit: string
  quantity: number
  supplier: string
}

const DEMO_ITEMS: CartItem[] = [
  {
    id: '1',
    name: 'Organic Oat Milk',
    price: 4.99,
    unit: 'case',
    quantity: 5,
    supplier: 'Green Valley',
  },
  {
    id: '2',
    name: 'Almond Butter',
    price: 12.5,
    unit: 'jar',
    quantity: 2,
    supplier: 'NutCo',
  },
  {
    id: '3',
    name: 'Sourdough Bread',
    price: 6.75,
    unit: 'loaf',
    quantity: 10,
    supplier: 'Baker Bros',
  },
]

export interface OrderCartHandle {
  focusNext: () => void
  focusPrev: () => void
  deleteSelected: () => void
  incrementSelected: () => void
  decrementSelected: () => void
}

interface OrderCartProps {
  initialItems?: CartItem[]
}

export const OrderCart = forwardRef<OrderCartHandle, OrderCartProps>(
  function OrderCart({ initialItems }, ref) {
    const [items, setItems] = useState<CartItem[]>(
      initialItems ?? [...DEMO_ITEMS],
    )
    const [selectedIndex, setSelectedIndex] = useState(-1)
    const itemsRef = useRef(items)
    itemsRef.current = items
    const selectedIndexRef = useRef(selectedIndex)
    selectedIndexRef.current = selectedIndex

    useEffect(() => {
      setSelectedIndex((prev) =>
        prev >= items.length ? Math.max(items.length - 1, -1) : prev,
      )
    }, [items.length])

    function updateQuantity(id: string, delta: number) {
      setItems((prev) =>
        prev.flatMap((item) => {
          if (item.id !== id) return [item]
          const next = item.quantity + delta
          return next <= 0 ? [] : [{ ...item, quantity: next }]
        }),
      )
    }

    function removeItem(id: string) {
      setItems((prev) => prev.filter((item) => item.id !== id))
    }

    useImperativeHandle(ref, () => ({
      focusNext() {
        setSelectedIndex((prev) => {
          if (itemsRef.current.length === 0) return -1
          return Math.min(prev + 1, itemsRef.current.length - 1)
        })
      },
      focusPrev() {
        setSelectedIndex((prev) => {
          if (itemsRef.current.length === 0) return -1
          return Math.max(prev - 1, 0)
        })
      },
      deleteSelected() {
        const idx = selectedIndexRef.current
        const currentItems = itemsRef.current
        if (idx >= 0 && idx < currentItems.length) {
          removeItem(currentItems[idx]!.id)
        }
      },
      incrementSelected() {
        const idx = selectedIndexRef.current
        const currentItems = itemsRef.current
        if (idx >= 0 && idx < currentItems.length) {
          updateQuantity(currentItems[idx]!.id, 1)
        }
      },
      decrementSelected() {
        const idx = selectedIndexRef.current
        const currentItems = itemsRef.current
        if (idx >= 0 && idx < currentItems.length) {
          updateQuantity(currentItems[idx]!.id, -1)
        }
      },
    }))

    const subtotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    )
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

    return (
      <TooltipProvider delayDuration={300}>
        <div className="flex h-full flex-col">
          <div className="flex items-center gap-2 border-b px-4 py-3">
            <ShoppingCart className="h-5 w-5 text-muted-foreground" />
            <h2 className="font-semibold">Cart</h2>
            {items.length > 0 && (
              <Badge variant="secondary" className="ml-auto">
                {itemCount}
              </Badge>
            )}
          </div>

          {items.length === 0 ? (
            <div className="flex flex-1 items-center justify-center p-4">
              <p className="text-sm text-muted-foreground">
                Your cart is empty. Browse categories or ask the assistant to
                add items.
              </p>
            </div>
          ) : (
            <ScrollArea className="flex-1">
              <div className="flex flex-col">
                {items.map((item, index) => (
                  <div key={item.id}>
                    {index > 0 && <Separator />}
                    <div
                      className={cn(
                        'flex flex-col gap-2 px-4 py-3',
                        index === selectedIndex && 'bg-accent',
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            {item.name}
                          </p>
                          <Badge variant="outline" className="mt-1 text-xs">
                            {item.supplier}
                          </Badge>
                        </div>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                              onClick={() => removeItem(item.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            Remove{' '}
                            <kbd className="ml-1 rounded border px-1 font-mono text-[10px]">
                              Del
                            </kbd>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => updateQuantity(item.id, -1)}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              Decrease{' '}
                              <kbd className="ml-1 rounded border px-1 font-mono text-[10px]">
                                -
                              </kbd>
                            </TooltipContent>
                          </Tooltip>
                          <span className="w-8 text-center text-sm">
                            {item.quantity}
                          </span>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => updateQuantity(item.id, 1)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              Increase{' '}
                              <kbd className="ml-1 rounded border px-1 font-mono text-[10px]">
                                +
                              </kbd>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          ${item.price.toFixed(2)}/{item.unit}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}

          <div className="border-t px-4 py-3">
            {items.length > 0 && (
              <div className="mb-3 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {itemCount} {itemCount === 1 ? 'item' : 'items'}
                </span>
                <span className="font-semibold">${subtotal.toFixed(2)}</span>
              </div>
            )}
            <Button className="w-full" disabled={items.length === 0}>
              Checkout
            </Button>
          </div>
        </div>
      </TooltipProvider>
    )
  },
)
