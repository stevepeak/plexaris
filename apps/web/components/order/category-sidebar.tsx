'use client'

import {
  Apple,
  Beef,
  ChevronRight,
  Croissant,
  CupSoda,
  Egg,
  Fish,
  Home,
  LayoutGrid,
  type LucideIcon,
  Milk,
  MoreHorizontal,
  Search,
  Store,
  Wheat,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'

const CATEGORIES = [
  { label: 'All products', icon: LayoutGrid },
  { label: 'Supplier', icon: Store },
  { label: 'Bread', icon: Wheat },
  { label: 'Pastry', icon: Croissant },
  { label: 'Dairy', icon: Milk },
  { label: 'Meat', icon: Beef },
  { label: 'Fish', icon: Fish },
  { label: 'Produce', icon: Apple },
  { label: 'Beverages', icon: CupSoda },
  { label: 'Ingredients', icon: Egg },
  { label: 'Other', icon: MoreHorizontal },
] as const satisfies readonly { label: string; icon: LucideIcon }[]

export type Category = (typeof CATEGORIES)[number]['label']

export interface BrowseProduct {
  id: string
  name: string
  description: string | null
  price: string | null
  unit: string | null
  category: string | null
  supplier: { id: string; name: string }
}

interface CategorySidebarProps {
  activeCategory: Category | null
  onNavigate: (category: Category | null) => void
  search: string
  onSearchChange: (value: string) => void
  products?: BrowseProduct[]
  isLoading?: boolean
}

export function CategorySidebar({
  activeCategory,
  onNavigate,
  search,
  onSearchChange,
  products,
  isLoading,
}: CategorySidebarProps) {
  const filtered = search
    ? CATEGORIES.filter((c) =>
        c.label.toLowerCase().includes(search.toLowerCase()),
      )
    : CATEGORIES

  return (
    <div className="flex h-full flex-col">
      <div className="relative border-b px-3 py-2">
        <Search className="absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="border-0 pl-7 shadow-none focus-visible:ring-0"
        />
      </div>

      {activeCategory && (
        <div className="flex items-center gap-1 border-b px-3 py-2 text-sm">
          <button
            type="button"
            className="text-muted-foreground hover:text-foreground"
            onClick={() => onNavigate(null)}
          >
            <Home className="h-3.5 w-3.5" />
          </button>
          <ChevronRight className="h-3 w-3 text-muted-foreground" />
          <span className="font-medium">{activeCategory}</span>
        </div>
      )}

      {activeCategory ||
      (search && (isLoading || (products && products.length > 0))) ? (
        <ScrollArea className="flex-1">
          {isLoading ? (
            <div className="flex flex-col gap-3 p-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-1.5">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              ))}
            </div>
          ) : products && products.length > 0 ? (
            <div className="flex flex-col gap-1 p-2">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="rounded-md px-3 py-2 text-sm hover:bg-accent"
                >
                  <div className="font-medium">{product.name}</div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    {product.price != null && (
                      <span>
                        {product.price}
                        {product.unit ? `/${product.unit}` : ''}
                      </span>
                    )}
                    <Badge variant="secondary" className="font-normal">
                      {product.supplier.name}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-1 items-center justify-center p-4">
              <p className="text-center text-sm text-muted-foreground">
                No products found
              </p>
            </div>
          )}
        </ScrollArea>
      ) : (
        <ScrollArea className="flex-1">
          <div className="flex flex-col gap-1 p-2">
            {filtered.map((category) => (
              <Button
                key={category.label}
                variant="ghost"
                className="justify-start gap-2"
                onClick={() => onNavigate(category.label)}
              >
                <category.icon className="h-4 w-4" />
                {category.label}
              </Button>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  )
}
