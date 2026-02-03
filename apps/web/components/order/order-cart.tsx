'use client'

import {
  closestCorners,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { FolderPlus, ShoppingCart } from 'lucide-react'
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
import { TooltipProvider } from '@/components/ui/tooltip'
import { useCartState } from '@/hooks/use-cart-state'

import { CartGroupHeader } from './cart-group-header'
import { CartItem, type CartItemData } from './cart-item'
import { CartLayoutMenu, type CartLayoutMode } from './cart-layout-menu'
import { SortableCartFolder } from './sortable-cart-folder'
import { SortableCartItem } from './sortable-cart-item'

const DEMO_ITEMS: CartItemData[] = [
  {
    id: '1',
    name: 'Organic Oat Milk',
    price: 4.99,
    unit: 'case',
    quantity: 5,
    supplier: 'Green Valley',
    supplierId: 'sup-1',
    category: 'Dairy Alternatives',
    assignee: 'Alice',
  },
  {
    id: '2',
    name: 'Almond Butter',
    price: 12.5,
    unit: 'jar',
    quantity: 2,
    supplier: 'NutCo',
    supplierId: 'sup-2',
    category: 'Spreads',
    assignee: 'Bob',
  },
  {
    id: '3',
    name: 'Sourdough Bread',
    price: 6.75,
    unit: 'loaf',
    quantity: 10,
    supplier: 'Baker Bros',
    supplierId: 'sup-3',
    category: 'Bakery',
    assignee: 'Alice',
  },
]

export interface OrderCartHandle {
  focusNext: () => void
  focusPrev: () => void
  deleteSelected: () => void
  incrementSelected: () => void
  decrementSelected: () => void
}

export interface OrderCartProps {
  initialItems?: CartItemData[]
  initialLayoutMode?: CartLayoutMode
  onOpenProduct?: (productId: string, productName: string) => void
  onOpenSupplier?: (supplierId: string, supplierName: string) => void
}

export const OrderCart = forwardRef<OrderCartHandle, OrderCartProps>(
  function OrderCart(
    { initialItems, initialLayoutMode, onOpenProduct, onOpenSupplier },
    ref,
  ) {
    const cart = useCartState(
      initialItems ?? [...DEMO_ITEMS],
      initialLayoutMode,
    )
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

    const sensors = useSensors(
      useSensor(PointerSensor, {
        activationConstraint: { distance: 5 },
      }),
      useSensor(KeyboardSensor, {
        coordinateGetter: sortableKeyboardCoordinates,
      }),
    )

    // Find the active item or folder for DragOverlay
    const activeItem = cart.activeId
      ? cart.state.items[cart.activeId]
      : undefined
    const activeFolder = cart.activeId
      ? cart.state.folders[cart.activeId]
      : undefined

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

    function renderFoldersMode() {
      return (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={cart.handleDragStart}
          onDragOver={cart.handleDragOver}
          onDragEnd={cart.handleDragEnd}
        >
          <SortableContext
            items={cart.state.rootOrder}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex flex-col">
              {cart.state.rootOrder.map((id) => {
                const folder = cart.state.folders[id]
                if (folder) {
                  const folderItemIds = cart.state.folderContents[id] ?? []
                  return (
                    <SortableCartFolder
                      key={id}
                      id={folder.id}
                      name={folder.name}
                      itemCount={cart.folderItemCount(id)}
                      subtotal={cart.folderSubtotal(id)}
                      open={!folder.collapsed}
                      onOpenChange={() => cart.toggleFolderCollapse(id)}
                      onRename={cart.renameFolder}
                      onDelete={cart.removeFolder}
                      itemIds={folderItemIds}
                    >
                      {folderItemIds.map((itemId) => {
                        const item = cart.state.items[itemId]
                        if (!item) return null
                        return (
                          <SortableCartItem
                            key={itemId}
                            item={item}
                            containerId={id}
                            className="pl-4"
                            {...itemCallbacks}
                          />
                        )
                      })}
                    </SortableCartFolder>
                  )
                }

                const item = cart.state.items[id]
                if (!item) return null
                return (
                  <SortableCartItem key={id} item={item} {...itemCallbacks} />
                )
              })}
            </div>
          </SortableContext>

          <DragOverlay>
            {activeItem ? (
              <div className="w-[288px] rounded-md border bg-background shadow-lg">
                <CartItem item={activeItem} />
              </div>
            ) : activeFolder ? (
              <div className="w-[288px] rounded-md border bg-background px-4 py-2 text-sm font-medium shadow-lg">
                {activeFolder.name}
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
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
                  <CartItem
                    key={item.id}
                    item={item}
                    className="pl-8"
                    {...itemCallbacks}
                  />
                ))}
              </CartGroupHeader>
            )
          })}
        </div>
      )
    }

    function renderContent() {
      if (cart.layoutMode === 'folders') return renderFoldersMode()
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
            {cart.allItems.length > 0 && (
              <Badge variant="secondary" className="ml-auto">
                {cart.itemCount}
              </Badge>
            )}
            <div className={cart.allItems.length > 0 ? '' : 'ml-auto'}>
              <CartLayoutMenu
                value={cart.layoutMode}
                onValueChange={cart.setLayoutMode}
              />
            </div>
            {cart.layoutMode === 'folders' && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => cart.addFolder()}
              >
                <FolderPlus className="h-4 w-4" />
              </Button>
            )}
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
            <Button className="w-full" disabled={cart.allItems.length === 0}>
              Checkout
            </Button>
          </div>
        </div>
      </TooltipProvider>
    )
  },
)
