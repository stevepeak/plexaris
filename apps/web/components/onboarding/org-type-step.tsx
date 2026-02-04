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
    <div className="grid grid-cols-2 gap-4">
      <button
        type="button"
        onClick={() => onSelect('supplier')}
        className={cn(
          'flex flex-col items-center gap-3 rounded-lg border p-6 text-center transition-colors hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30',
          selected === 'supplier'
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30'
            : 'border-border',
        )}
      >
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/40">
          <Store className="h-6 w-6 text-blue-600 dark:text-blue-400" />
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
          'flex flex-col items-center gap-3 rounded-lg border p-6 text-center transition-colors hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/30',
          selected === 'horeca'
            ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/30'
            : 'border-border',
        )}
      >
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/40">
          <UtensilsCrossed className="h-6 w-6 text-orange-600 dark:text-orange-400" />
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
