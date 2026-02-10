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
    <div className="grid max-w-lg grid-cols-2 gap-4">
      <button
        type="button"
        onClick={() => onSelect('supplier')}
        className={cn(
          'group relative overflow-hidden rounded-xl border bg-gradient-to-br from-card via-card to-muted/30 p-6 text-left shadow-sm transition-all duration-300',
          'hover:border-foreground/30 hover:shadow-lg',
          selected === 'supplier' && 'border-foreground/30 shadow-lg',
        )}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-blue-500/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <div className="relative flex flex-col items-start gap-3">
          <div className="flex size-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 transition-transform duration-300 group-hover:scale-110">
            <Store className="size-6" />
          </div>
          <div>
            <div className="font-medium">Supplier</div>
            <div className="mt-1 text-sm text-muted-foreground">
              I sell food products to restaurants, hotels, and catering
              businesses
            </div>
          </div>
          <div className="flex items-center gap-2 pt-2 text-sm font-medium text-blue-600 transition-colors group-hover:text-blue-500">
            <span>Continue as Supplier</span>
            <span className="transition-transform duration-200 group-hover:translate-x-1">
              →
            </span>
          </div>
        </div>
      </button>
      <button
        type="button"
        onClick={() => onSelect('horeca')}
        className={cn(
          'group relative overflow-hidden rounded-xl border bg-gradient-to-br from-card via-card to-muted/30 p-6 text-left shadow-sm transition-all duration-300',
          'hover:border-foreground/30 hover:shadow-lg',
          selected === 'horeca' && 'border-foreground/30 shadow-lg',
        )}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-amber-500/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <div className="relative flex flex-col items-start gap-3">
          <div className="flex size-12 items-center justify-center rounded-xl bg-orange-500/10 text-orange-600 transition-transform duration-300 group-hover:scale-110">
            <UtensilsCrossed className="size-6" />
          </div>
          <div>
            <div className="font-medium">Horeca</div>
            <div className="mt-1 text-sm text-muted-foreground">
              I run a restaurant, hotel, or catering business and buy from
              suppliers
            </div>
          </div>
          <div className="flex items-center gap-2 pt-2 text-sm font-medium text-orange-600 transition-colors group-hover:text-orange-500">
            <span>Continue as Horeca</span>
            <span className="transition-transform duration-200 group-hover:translate-x-1">
              →
            </span>
          </div>
        </div>
      </button>
    </div>
  )
}
