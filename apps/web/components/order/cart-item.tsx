import { Minus, Plus, Trash2 } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

export interface CartItemData {
  id: string
  name: string
  price: number
  unit: string
  quantity: number
  supplier: string
  supplierId: string
  category?: string
  assignee?: string
}

export interface CartItemProps {
  item: CartItemData
  selected?: boolean
  onUpdateQuantity?: (id: string, delta: number) => void
  onRemove?: (id: string) => void
  onOpenProduct?: (productId: string, productName: string) => void
  onOpenSupplier?: (supplierId: string, supplierName: string) => void
}

export function CartItem({
  item,
  selected,
  onUpdateQuantity,
  onRemove,
  onOpenProduct,
  onOpenSupplier,
}: CartItemProps) {
  return (
    <div
      className={cn('flex flex-col gap-2 px-4 py-3', selected && 'bg-accent')}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <button
            type="button"
            className="truncate text-sm font-medium hover:underline"
            onClick={() => onOpenProduct?.(item.id, item.name)}
          >
            {item.name}
          </button>
          <div className="mt-1">
            <Badge
              variant="outline"
              className={cn('text-xs', onOpenSupplier && 'cursor-pointer')}
              onClick={() => onOpenSupplier?.(item.supplierId, item.supplier)}
            >
              {item.supplier}
            </Badge>
          </div>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
              onClick={() => onRemove?.(item.id)}
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
                onClick={() => onUpdateQuantity?.(item.id, -1)}
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
          <span className="w-8 text-center text-sm">{item.quantity}</span>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                onClick={() => onUpdateQuantity?.(item.id, 1)}
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
  )
}
