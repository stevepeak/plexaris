'use i18n'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'

import { cn } from '@/lib/utils'

import { CartItem, type CartItemProps } from './cart-item'

interface SortableCartItemProps extends CartItemProps {
  /** The folder id this item belongs to, or undefined for root-level items */
  containerId?: string
  /** Layout className applied to the sortable wrapper, not the item */
  className?: string
}

export function SortableCartItem({
  containerId,
  className,
  item,
  ...itemProps
}: SortableCartItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: item.id,
    data: { type: 'item' as const, containerId },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(isDragging && 'z-10 opacity-50', className)}
      {...attributes}
    >
      <div className="flex">
        <button
          ref={setActivatorNodeRef}
          type="button"
          className="flex shrink-0 cursor-grab items-center px-1 text-muted-foreground hover:text-foreground active:cursor-grabbing"
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <div className="min-w-0 flex-1">
          <CartItem item={item} {...itemProps} />
        </div>
      </div>
    </div>
  )
}
