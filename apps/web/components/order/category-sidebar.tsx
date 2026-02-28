'use i18n'
'use client'

import {
  BookOpen,
  ChefHat,
  ChevronRight,
  Croissant,
  Heart,
  Home,
  LayoutGrid,
  type LucideIcon,
  Package,
  Search,
  ShoppingBag,
  Star,
  Store,
  TrendingUp,
  Truck,
} from 'lucide-react'
import { useState } from 'react'

import { Kbd } from '@/components/kbd'
import { BrowseHome, type BrowseSection } from '@/components/order/browse-home'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import {
  buildCategoryValue,
  parseCategoryValue,
  PRODUCT_CATEGORIES,
} from '@/lib/product-categories'

interface CategoryDef {
  label: string
  icon: LucideIcon
}

const SECTION_CATEGORIES: Record<BrowseSection, CategoryDef[]> = {
  products: [
    { label: 'All products', icon: LayoutGrid },
    ...PRODUCT_CATEGORIES,
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

const SECTION_ICONS: Record<BrowseSection, LucideIcon> = {
  favorites: Star,
  products: Package,
  suppliers: Store,
  recipes: ChefHat,
}

function SectionLabel({ text }: { text: string }) {
  switch (text) {
    case 'Favorites':
      return <span>Favorites</span>
    case 'Products':
      return <span>Products</span>
    case 'Suppliers':
      return <span>Suppliers</span>
    case 'Recipes':
      return <span>Recipes</span>
    default:
      return <span>{text}</span>
  }
}

function CategoryLabel({ text }: { text: string }) {
  switch (text) {
    case 'All products':
      return <span>All products</span>
    case 'All suppliers':
      return <span>All suppliers</span>
    case 'Local farms':
      return <span>Local farms</span>
    case 'Wholesale':
      return <span>Wholesale</span>
    case 'Specialty':
      return <span>Specialty</span>
    case 'All favorites':
      return <span>All favorites</span>
    case 'Most ordered':
      return <span>Most ordered</span>
    case 'Recently added':
      return <span>Recently added</span>
    case 'All recipes':
      return <span>All recipes</span>
    case 'Breakfast':
      return <span>Breakfast</span>
    case 'Lunch':
      return <span>Lunch</span>
    case 'Dinner':
      return <span>Dinner</span>
    case 'Guides':
      return <span>Guides</span>
    case 'Bread':
      return <span>Bread</span>
    case 'Pastry':
      return <span>Pastry</span>
    case 'Dairy':
      return <span>Dairy</span>
    case 'Meat':
      return <span>Meat</span>
    case 'Fish':
      return <span>Fish</span>
    case 'Produce':
      return <span>Produce</span>
    case 'Beverages':
      return <span>Beverages</span>
    case 'Ingredients':
      return <span>Ingredients</span>
    case 'Other':
      return <span>Other</span>
    default:
      return <span>{text}</span>
  }
}

function AllCategoryLabel({ text }: { text: string }) {
  switch (text) {
    case 'Bread':
      return <span>All Bread</span>
    case 'Pastry':
      return <span>All Pastry</span>
    case 'Dairy':
      return <span>All Dairy</span>
    case 'Meat':
      return <span>All Meat</span>
    case 'Fish':
      return <span>All Fish</span>
    case 'Produce':
      return <span>All Produce</span>
    case 'Beverages':
      return <span>All Beverages</span>
    case 'Ingredients':
      return <span>All Ingredients</span>
    case 'Other':
      return <span>All Other</span>
    default:
      return <span>All {text}</span>
  }
}

function SubcategoryLabel({ text }: { text: string }) {
  switch (text) {
    case 'Sourdough':
      return <span>Sourdough</span>
    case 'White bread':
      return <span>White bread</span>
    case 'Whole wheat':
      return <span>Whole wheat</span>
    case 'Rye':
      return <span>Rye</span>
    case 'Rolls':
      return <span>Rolls</span>
    case 'Croissants':
      return <span>Croissants</span>
    case 'Danish':
      return <span>Danish</span>
    case 'Pies':
      return <span>Pies</span>
    case 'Cakes':
      return <span>Cakes</span>
    case 'Cookies':
      return <span>Cookies</span>
    case 'Milk':
      return <span>Milk</span>
    case 'Cheese':
      return <span>Cheese</span>
    case 'Yogurt':
      return <span>Yogurt</span>
    case 'Butter':
      return <span>Butter</span>
    case 'Cream':
      return <span>Cream</span>
    case 'Beef':
      return <span>Beef</span>
    case 'Pork':
      return <span>Pork</span>
    case 'Poultry':
      return <span>Poultry</span>
    case 'Lamb':
      return <span>Lamb</span>
    case 'Charcuterie':
      return <span>Charcuterie</span>
    case 'Fresh fish':
      return <span>Fresh fish</span>
    case 'Frozen fish':
      return <span>Frozen fish</span>
    case 'Smoked fish':
      return <span>Smoked fish</span>
    case 'Shellfish':
      return <span>Shellfish</span>
    case 'Vegetables':
      return <span>Vegetables</span>
    case 'Fruit':
      return <span>Fruit</span>
    case 'Herbs':
      return <span>Herbs</span>
    case 'Salads':
      return <span>Salads</span>
    case 'Juices':
      return <span>Juices</span>
    case 'Soft drinks':
      return <span>Soft drinks</span>
    case 'Water':
      return <span>Water</span>
    case 'Coffee':
      return <span>Coffee</span>
    case 'Tea':
      return <span>Tea</span>
    case 'Eggs':
      return <span>Eggs</span>
    case 'Flour':
      return <span>Flour</span>
    case 'Sugar':
      return <span>Sugar</span>
    case 'Oils':
      return <span>Oils</span>
    case 'Spices':
      return <span>Spices</span>
    default:
      return <span>{text}</span>
  }
}

export interface BrowseProduct {
  id: string
  name: string
  description: string | null
  price: string | null
  unit: string | null
  category: string | null
  articleNumber?: string | null
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
            <Kbd className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-muted-foreground">
              S
            </Kbd>
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
          <Kbd className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-muted-foreground">
            S
          </Kbd>
        )}
      </div>

      <Breadcrumbs
        activeSection={activeSection}
        activeCategory={activeCategory}
        onSectionChange={onSectionChange}
        onNavigate={onNavigate}
      />

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
            {filtered.map((cat) => {
              const catDef =
                activeSection === 'products'
                  ? PRODUCT_CATEGORIES.find((c) => c.label === cat.label)
                  : undefined
              const hasSubs =
                catDef?.subcategories && catDef.subcategories.length > 0
              return hasSubs ? (
                <SubCategoryGroup
                  key={cat.label}
                  category={catDef!}
                  icon={cat.icon}
                  onNavigate={onNavigate}
                />
              ) : (
                <Button
                  key={cat.label}
                  variant="ghost"
                  className="justify-start gap-2"
                  onClick={() => onNavigate(cat.label)}
                >
                  <cat.icon className="h-4 w-4" />
                  <CategoryLabel text={cat.label} />
                </Button>
              )
            })}
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
            <div className="flex items-center gap-1.5">
              <span className="font-medium">{product.name}</span>
              {product.articleNumber && (
                <Badge
                  variant="outline"
                  className="shrink-0 font-mono text-[10px]"
                >
                  #{product.articleNumber}
                </Badge>
              )}
            </div>
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

function Breadcrumbs({
  activeSection,
  activeCategory,
  onSectionChange,
  onNavigate,
}: {
  activeSection: BrowseSection
  activeCategory: string | null
  onSectionChange: (section: BrowseSection | null) => void
  onNavigate: (category: string | null) => void
}) {
  const parsed = activeCategory ? parseCategoryValue(activeCategory) : null
  const SectionIcon = SECTION_ICONS[activeSection]

  return (
    <div className="flex min-w-0 items-center gap-1 overflow-hidden border-b px-3 py-2 text-sm">
      <button
        type="button"
        className="text-muted-foreground hover:text-foreground"
        onClick={() => onSectionChange(null)}
      >
        <Home className="h-3.5 w-3.5" />
      </button>
      <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground" />
      {activeCategory ? (
        <>
          <button
            type="button"
            className="shrink-0 text-muted-foreground hover:text-foreground"
            onClick={() => onNavigate(null)}
          >
            <SectionIcon className="h-3.5 w-3.5" />
          </button>
          {parsed?.sub ? (
            <>
              <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground" />
              <button
                type="button"
                className="min-w-0 truncate text-muted-foreground hover:text-foreground"
                onClick={() => onNavigate(parsed.primary)}
              >
                <CategoryLabel text={parsed.primary} />
              </button>
              <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground" />
              <span className="min-w-0 truncate font-medium">
                <SubcategoryLabel text={parsed.sub} />
              </span>
            </>
          ) : (
            <>
              <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground" />
              <span className="min-w-0 truncate font-medium">
                <CategoryLabel text={activeCategory} />
              </span>
            </>
          )}
        </>
      ) : (
        <span className="min-w-0 truncate font-medium">
          <SectionLabel text={SECTION_LABELS[activeSection]} />
        </span>
      )}
    </div>
  )
}

function SubCategoryGroup({
  category,
  icon,
  onNavigate,
}: {
  category: { label: string; subcategories?: string[] }
  icon: React.ComponentType<{ className?: string }>
  onNavigate: (category: string) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const IconComp = icon

  return (
    <div>
      <Button
        variant="ghost"
        className="w-full justify-start gap-2"
        onClick={() => setExpanded((e) => !e)}
      >
        <IconComp className="h-4 w-4" />
        <CategoryLabel text={category.label} />
        <ChevronRight
          className={`ml-auto h-3.5 w-3.5 text-muted-foreground transition-transform ${expanded ? 'rotate-90' : ''}`}
        />
      </Button>
      {expanded && (
        <div className="ml-6 flex flex-col gap-0.5">
          <Button
            variant="ghost"
            size="sm"
            className="justify-start text-xs"
            onClick={() => onNavigate(category.label)}
          >
            <AllCategoryLabel text={category.label} />
          </Button>
          {category.subcategories?.map((sub) => (
            <Button
              key={sub}
              variant="ghost"
              size="sm"
              className="justify-start text-xs"
              onClick={() =>
                onNavigate(buildCategoryValue(category.label, sub))
              }
            >
              <SubcategoryLabel text={sub} />
            </Button>
          ))}
        </div>
      )}
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
