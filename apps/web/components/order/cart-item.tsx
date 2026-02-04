import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

interface CartItemAddedBy {
  name: string
  avatarUrl?: string
  addedAt: Date
}

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
  addedBy?: CartItemAddedBy
}

export interface CartItemProps {
  item: CartItemData
  selected?: boolean
  onUpdateQuantity?: (id: string, delta: number) => void
  onRemove?: (id: string) => void
  onOpenProduct?: (productId: string, productName: string) => void
  onOpenSupplier?: (supplierId: string, supplierName: string) => void
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function formatTimestamp(date: Date) {
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function CartItem({
  item,
  selected,
  onOpenProduct,
  onOpenSupplier,
}: CartItemProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-0.5 px-4 py-2.5',
        selected && 'bg-accent',
      )}
    >
      <button
        type="button"
        className="truncate text-left text-sm font-medium hover:underline"
        onClick={() => onOpenProduct?.(item.id, item.name)}
      >
        {item.name}
      </button>
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <span>from</span>
        <button
          type="button"
          className={cn(
            'font-medium text-foreground',
            onOpenSupplier && 'hover:underline',
          )}
          onClick={() => onOpenSupplier?.(item.supplierId, item.supplier)}
        >
          {item.supplier}
        </button>
        {item.addedBy && (
          <>
            <span>added by</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <button type="button" className="shrink-0">
                  <Avatar className="h-4 w-4">
                    {item.addedBy.avatarUrl && (
                      <AvatarImage
                        src={item.addedBy.avatarUrl}
                        alt={item.addedBy.name}
                      />
                    )}
                    <AvatarFallback className="text-[8px]">
                      {getInitials(item.addedBy.name)}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </TooltipTrigger>
              <TooltipContent>
                {item.addedBy.name} &middot;{' '}
                {formatTimestamp(item.addedBy.addedAt)}
              </TooltipContent>
            </Tooltip>
          </>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        {item.quantity} {item.unit}
        {item.quantity !== 1 && !item.unit.endsWith('s') ? 's' : ''} at $
        {item.price.toFixed(2)} each
      </p>
    </div>
  )
}
