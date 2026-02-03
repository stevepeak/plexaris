import { ChevronRight } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'

interface CartGroupHeaderProps {
  label: string
  itemCount: number
  subtotal: number
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

export function CartGroupHeader({
  label,
  itemCount,
  subtotal,
  open,
  onOpenChange,
  children,
}: CartGroupHeaderProps) {
  return (
    <Collapsible open={open} onOpenChange={onOpenChange}>
      <CollapsibleTrigger className="flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-accent">
        <ChevronRight
          className={cn(
            'h-4 w-4 shrink-0 transition-transform',
            open && 'rotate-90',
          )}
        />
        <span className="flex-1 truncate text-left font-medium">{label}</span>
        <Badge variant="secondary" className="text-xs">
          {itemCount}
        </Badge>
        <span className="shrink-0 text-xs text-muted-foreground">
          ${subtotal.toFixed(2)}
        </span>
      </CollapsibleTrigger>
      <CollapsibleContent>{children}</CollapsibleContent>
    </Collapsible>
  )
}
