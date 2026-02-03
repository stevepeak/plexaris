'use client'

import {
  Apple,
  Beef,
  BookOpen,
  ChefHat,
  ChevronRight,
  Croissant,
  CupSoda,
  Egg,
  Fish,
  Heart,
  Home,
  LayoutGrid,
  type LucideIcon,
  Milk,
  MoreHorizontal,
  Search,
  ShoppingBag,
  Star,
  Store,
  TrendingUp,
  Truck,
  Wheat,
} from 'lucide-react'

import { BrowseHome, type BrowseSection } from '@/components/order/browse-home'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'

interface CategoryDef {
  label: string
  icon: LucideIcon
}

const SECTION_CATEGORIES: Record<BrowseSection, CategoryDef[]> = {
  products: [
    { label: 'All products', icon: LayoutGrid },
    { label: 'Bread', icon: Wheat },
    { label: 'Pastry', icon: Croissant },
    { label: 'Dairy', icon: Milk },
    { label: 'Meat', icon: Beef },
    { label: 'Fish', icon: Fish },
    { label: 'Produce', icon: Apple },
    { label: 'Beverages', icon: CupSoda },
    { label: 'Ingredients', icon: Egg },
    { label: 'Other', icon: MoreHorizontal },
  ],
  suppliers: [
    { label: 'All suppliers', icon: LayoutGrid },
    { label: 'Local farms', icon: Truck },
    { label: 'Wholesale', icon: ShoppingBag },
    { label: 'Specialty', icon: Star },
  ],
  favorites: [
    { label: 'All favorites', icon: LayoutGrid },
    { label: 'Most ordered', icon: TrendingUp },
    { label: 'Recently added', icon: Heart },
  ],
  recipes: [
    { label: 'All recipes', icon: LayoutGrid },
    { label: 'Breakfast', icon: Croissant },
    { label: 'Lunch', icon: ChefHat },
    { label: 'Dinner', icon: Store },
    { label: 'Guides', icon: BookOpen },
  ],
}

const SECTION_LABELS: Record<BrowseSection, string> = {
  favorites: 'Favorites',
  products: 'Products',
  suppliers: 'Suppliers',
  recipes: 'Recipes',
}

export interface BrowseProduct {
  id: string
  name: string
  description: string | null
  price: string | null
  unit: string | null
  category: string | null
  supplier: { id: string; name: string }
  isFavorited?: boolean
}

export interface BrowseSupplier {
  id: string
  name: string
  description: string | null
}

interface CategorySidebarProps {
  searchInputRef?: React.RefObject<HTMLInputElement | null>
  activeSection: BrowseSection | null
  onSectionChange: (section: BrowseSection | null) => void
  activeCategory: string | null
  onNavigate: (category: string | null) => void
  search: string
  onSearchChange: (value: string) => void
  products?: BrowseProduct[]
  suppliers?: BrowseSupplier[]
  isLoading?: boolean
  onProductClick?: (product: BrowseProduct) => void
  onSupplierClick?: (supplier: BrowseSupplier) => void
}

export function CategorySidebar({
  searchInputRef,
  activeSection,
  onSectionChange,
  activeCategory,
  onNavigate,
  search,
  onSearchChange,
  products,
  suppliers,
  isLoading,
  onProductClick,
  onSupplierClick,
}: CategorySidebarProps) {
  if (activeSection === null) {
    return (
      <div className="flex h-full flex-col">
        <div className="relative border-b px-3 py-2">
          <Search className="absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={searchInputRef}
            placeholder="Search..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="border-0 pl-7 pr-8 shadow-none focus-visible:ring-0"
          />
          {!search && (
            <kbd className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 rounded border px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
              S
            </kbd>
          )}
        </div>

        {search && (isLoading || (products && products.length > 0)) ? (
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
              <ProductList
                products={products}
                onProductClick={onProductClick}
              />
            ) : null}
          </ScrollArea>
        ) : (
          <ScrollArea className="flex-1">
            <BrowseHome onSelect={onSectionChange} />
          </ScrollArea>
        )}
      </div>
    )
  }

  const categories = SECTION_CATEGORIES[activeSection] ?? []
  const filtered = search
    ? categories.filter((c) =>
        c.label.toLowerCase().includes(search.toLowerCase()),
      )
    : categories

  return (
    <div className="flex h-full flex-col">
      <div className="relative border-b px-3 py-2">
        <Search className="absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={searchInputRef}
          placeholder="Search..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="border-0 pl-7 pr-8 shadow-none focus-visible:ring-0"
        />
        {!search && (
          <kbd className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 rounded border px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
            S
          </kbd>
        )}
      </div>

      <div className="flex items-center gap-1 border-b px-3 py-2 text-sm">
        <button
          type="button"
          className="text-muted-foreground hover:text-foreground"
          onClick={() => onSectionChange(null)}
        >
          <Home className="h-3.5 w-3.5" />
        </button>
        <ChevronRight className="h-3 w-3 text-muted-foreground" />
        {activeCategory ? (
          <>
            <button
              type="button"
              className="text-muted-foreground hover:text-foreground"
              onClick={() => onNavigate(null)}
            >
              {SECTION_LABELS[activeSection]}
            </button>
            <ChevronRight className="h-3 w-3 text-muted-foreground" />
            <span className="font-medium">{activeCategory}</span>
          </>
        ) : (
          <span className="font-medium">{SECTION_LABELS[activeSection]}</span>
        )}
      </div>

      {activeSection === 'suppliers' ? (
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
          ) : suppliers && suppliers.length > 0 ? (
            <SupplierList
              suppliers={suppliers}
              onSupplierClick={onSupplierClick}
            />
          ) : (
            <div className="flex flex-1 items-center justify-center p-4">
              <p className="text-center text-sm text-muted-foreground">
                No suppliers found
              </p>
            </div>
          )}
        </ScrollArea>
      ) : activeCategory ||
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
            <ProductList products={products} onProductClick={onProductClick} />
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

function ProductList({
  products,
  onProductClick,
}: {
  products: BrowseProduct[]
  onProductClick?: (product: BrowseProduct) => void
}) {
  return (
    <div className="flex flex-col gap-1 p-2">
      {products.map((product) => (
        <button
          key={product.id}
          type="button"
          className="flex items-start gap-2 rounded-md px-3 py-2 text-left text-sm hover:bg-accent"
          onClick={() => onProductClick?.(product)}
        >
          <div className="min-w-0 flex-1">
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
          {product.isFavorited && (
            <Star className="mt-0.5 h-3.5 w-3.5 shrink-0 fill-amber-400 text-amber-400" />
          )}
        </button>
      ))}
    </div>
  )
}

function SupplierList({
  suppliers,
  onSupplierClick,
}: {
  suppliers: BrowseSupplier[]
  onSupplierClick?: (supplier: BrowseSupplier) => void
}) {
  return (
    <div className="flex flex-col gap-1 p-2">
      {suppliers.map((supplier) => (
        <button
          key={supplier.id}
          type="button"
          className="flex items-start gap-2 rounded-md px-3 py-2 text-left text-sm hover:bg-accent"
          onClick={() => onSupplierClick?.(supplier)}
        >
          <Store className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <div className="min-w-0 flex-1">
            <div className="font-medium">{supplier.name}</div>
            {supplier.description && (
              <div className="line-clamp-1 text-xs text-muted-foreground">
                {supplier.description}
              </div>
            )}
          </div>
        </button>
      ))}
    </div>
  )
}
