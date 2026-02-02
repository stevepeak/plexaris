'use client'

import { Store, UtensilsCrossed } from 'lucide-react'

import { cn } from '@/lib/utils'

type OrgType = 'supplier' | 'horeca'

export function OrgTypeStep({
  selected,
  onSelect,
}: {
  selected: OrgType | null
  onSelect: (type: OrgType) => void
}) {
  return (
    <div className="grid gap-4">
      <button
        type="button"
        onClick={() => onSelect('supplier')}
        className={cn(
          'flex items-start gap-4 rounded-lg border p-4 text-left transition-colors hover:border-primary hover:bg-accent',
          selected === 'supplier' && 'border-primary bg-accent',
        )}
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <Store className="h-5 w-5 text-primary" />
        </div>
        <div>
          <div className="font-medium">Supplier</div>
          <div className="mt-1 text-sm text-muted-foreground">
            I sell food products to restaurants, hotels, and catering businesses
          </div>
        </div>
      </button>
      <button
        type="button"
        onClick={() => onSelect('horeca')}
        className={cn(
          'flex items-start gap-4 rounded-lg border p-4 text-left transition-colors hover:border-primary hover:bg-accent',
          selected === 'horeca' && 'border-primary bg-accent',
        )}
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <UtensilsCrossed className="h-5 w-5 text-primary" />
        </div>
        <div>
          <div className="font-medium">Horeca</div>
          <div className="mt-1 text-sm text-muted-foreground">
            I run a restaurant, hotel, or catering business and buy from
            suppliers
          </div>
        </div>
      </button>
    </div>
  )
}
