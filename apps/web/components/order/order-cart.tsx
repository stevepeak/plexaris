'use client'

import { ShoppingCart } from 'lucide-react'
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'

import { Kbd } from '@/components/kbd'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { type CartStateReturn } from '@/hooks/use-cart-state'

import { CartGroupHeader } from './cart-group-header'
import { CartItem } from './cart-item'
import { CartLayoutMenu } from './cart-layout-menu'

export interface OrderCartHandle {
  focusNext: () => void
  focusPrev: () => void
  deleteSelected: () => void
  incrementSelected: () => void
  decrementSelected: () => void
}

interface OrderCartProps {
  cart: CartStateReturn
  onOpenProduct?: (productId: string, productName: string) => void
  onOpenSupplier?: (supplierId: string, supplierName: string) => void
  onOpenCartTab?: () => void
  onOpenActivityTab?: () => void
}

export const OrderCart = forwardRef<OrderCartHandle, OrderCartProps>(
  function OrderCart(
    { cart, onOpenProduct, onOpenSupplier, onOpenCartTab, onOpenActivityTab },
    ref,
  ) {
    const [selectedIndex, setSelectedIndex] = useState(-1)
    const allItemsRef = useRef(cart.allItems)
    allItemsRef.current = cart.allItems
    const selectedIndexRef = useRef(selectedIndex)
    selectedIndexRef.current = selectedIndex

    useEffect(() => {
      setSelectedIndex((prev) =>
        prev >= cart.allItems.length
          ? Math.max(cart.allItems.length - 1, -1)
          : prev,
      )
    }, [cart.allItems.length])

    useImperativeHandle(ref, () => ({
      focusNext() {
        setSelectedIndex((prev) => {
          if (allItemsRef.current.length === 0) return -1
          return Math.min(prev + 1, allItemsRef.current.length - 1)
        })
      },
      focusPrev() {
        setSelectedIndex((prev) => {
          if (allItemsRef.current.length === 0) return -1
          return Math.max(prev - 1, 0)
        })
      },
      deleteSelected() {
        const idx = selectedIndexRef.current
        const currentItems = allItemsRef.current
        if (idx >= 0 && idx < currentItems.length) {
          cart.removeItem(currentItems[idx]!.id)
        }
      },
      incrementSelected() {
        const idx = selectedIndexRef.current
        const currentItems = allItemsRef.current
        if (idx >= 0 && idx < currentItems.length) {
          cart.updateQuantity(currentItems[idx]!.id, 1)
        }
      },
      decrementSelected() {
        const idx = selectedIndexRef.current
        const currentItems = allItemsRef.current
        if (idx >= 0 && idx < currentItems.length) {
          cart.updateQuantity(currentItems[idx]!.id, -1)
        }
      },
    }))

    const itemCallbacks = {
      onUpdateQuantity: cart.updateQuantity,
      onRemove: cart.removeItem,
      onOpenProduct,
      onOpenSupplier,
    }

    function renderFlatList() {
      return (
        <div className="flex flex-col">
          {cart.allItems.map((item, index) => (
            <div key={item.id}>
              {index > 0 && <Separator />}
              <CartItem
                item={item}
                selected={index === selectedIndex}
                {...itemCallbacks}
              />
            </div>
          ))}
        </div>
      )
    }

    function renderGroupedMode() {
      return (
        <div className="flex flex-col">
          {cart.groups.map((group) => {
            const isOpen = !cart.collapsedGroups.has(group.key)
            return (
              <CartGroupHeader
                key={group.key}
                label={group.label}
                itemCount={cart.groupItemCount(group.key)}
                subtotal={cart.groupSubtotal(group.key)}
                open={isOpen}
                onOpenChange={() => cart.toggleGroupCollapse(group.key)}
              >
                {group.items.map((item) => (
                  <div key={item.id} className="pl-8">
                    <CartItem item={item} {...itemCallbacks} />
                  </div>
                ))}
              </CartGroupHeader>
            )
          })}
        </div>
      )
    }

    function renderContent() {
      if (
        cart.layoutMode === 'by-supplier' ||
        cart.layoutMode === 'by-category' ||
        cart.layoutMode === 'by-team-member'
      ) {
        return renderGroupedMode()
      }
      return renderFlatList()
    }

    return (
      <TooltipProvider delayDuration={300}>
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center gap-2 border-b px-4 py-3">
            <ShoppingCart className="h-5 w-5 text-muted-foreground" />
            <h2 className="font-semibold">Cart</h2>
            <Kbd>k</Kbd>
            <div className="ml-auto">
              <CartLayoutMenu
                value={cart.layoutMode}
                onValueChange={cart.setLayoutMode}
              />
            </div>
          </div>

          {/* Body */}
          {cart.allItems.length === 0 ? (
            <div className="flex flex-1 items-center justify-center p-4">
              <p className="text-sm text-muted-foreground">
                Your cart is empty. Browse categories or ask the assistant to
                add items.
              </p>
            </div>
          ) : (
            <ScrollArea className="flex-1">{renderContent()}</ScrollArea>
          )}

          {/* Footer */}
          <div className="border-t px-4 py-3">
            {cart.allItems.length > 0 && (
              <div className="mb-3 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {cart.itemCount} {cart.itemCount === 1 ? 'item' : 'items'}
                </span>
                <span className="font-semibold">
                  ${cart.subtotal.toFixed(2)}
                </span>
              </div>
            )}
            <div className="flex gap-2">
              {onOpenCartTab && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={onOpenCartTab}
                      disabled={cart.allItems.length === 0}
                    >
                      Edit Cart
                      <Kbd className="ml-1.5">E</Kbd>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    Edit cart <Kbd className="ml-1">E</Kbd>
                  </TooltipContent>
                </Tooltip>
              )}
              <Button
                className={onOpenCartTab ? 'flex-1' : 'w-full'}
                disabled={cart.allItems.length === 0}
              >
                Checkout
              </Button>
            </div>
            {onOpenActivityTab && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    className="mt-1 w-full"
                    onClick={onOpenActivityTab}
                  >
                    View activity
                    <Kbd className="ml-1.5">A</Kbd>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  View activity <Kbd className="ml-1">A</Kbd>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>
      </TooltipProvider>
    )
  },
)
