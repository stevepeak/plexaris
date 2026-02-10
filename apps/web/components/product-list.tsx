'use client'

import {
  ArrowDown,
  ArrowUp,
  Check,
  LayoutGrid,
  ListFilter,
  Package,
  Plus,
  Printer,
  Search,
  TableIcon,
} from 'lucide-react'
import { useMemo, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

export type Product = {
  id: string
  name: string
  description: string | null
  price: string | null
  unit: string | null
  category: string | null
  status: string
  images: string[]
  createdAt: string
  updatedAt: string
  archivedAt: string | null
}

type SortField = 'name' | 'category' | 'price' | 'status'
type SortDirection = 'asc' | 'desc'

interface ProductFilters {
  statuses: Set<string>
  categories: Set<string>
}

function statusBadgeVariant(status: string) {
  switch (status) {
    case 'active':
      return 'default' as const
    case 'draft':
      return 'secondary' as const
    case 'archived':
      return 'outline' as const
    default:
      return 'secondary' as const
  }
}

function formatPrice(price: string | null, unit: string | null) {
  if (price == null) return '-'
  const formatted = new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
  }).format(Number(price))
  if (unit) return `${formatted} / ${unit}`
  return formatted
}

function ProductCardGrid({
  products,
  isOwner,
  onEditProduct,
}: {
  products: Product[]
  isOwner: boolean
  onEditProduct?: (product: Product) => void
}) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Package className="h-12 w-12 text-muted-foreground/50" />
        <p className="mt-4 text-sm text-muted-foreground">
          {isOwner
            ? 'Add your first product to get started.'
            : 'This supplier has no products yet.'}
        </p>
      </div>
    )
  }

  const grouped = new Map<string, Product[]>()
  for (const product of products) {
    const category = product.category ?? 'Uncategorized'
    const group = grouped.get(category)
    if (group) {
      group.push(product)
    } else {
      grouped.set(category, [product])
    }
  }

  return (
    <div className="space-y-8">
      {Array.from(grouped.entries()).map(([category, categoryProducts]) => (
        <div key={category}>
          <h3 className="mb-3 text-sm font-medium text-muted-foreground">
            {category}
          </h3>
          <div className="grid grid-cols-3 gap-4">
            {categoryProducts.map((product) => (
              <Card
                key={product.id}
                className={cn(
                  'overflow-hidden',
                  isOwner &&
                    onEditProduct &&
                    'cursor-pointer hover:border-foreground/20',
                )}
                onClick={
                  isOwner && onEditProduct
                    ? () => onEditProduct(product)
                    : undefined
                }
              >
                {product.images[0] && (
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-medium leading-tight">
                      {product.name}
                    </h3>
                    {product.status !== 'active' && (
                      <Badge
                        variant={statusBadgeVariant(product.status)}
                        className="shrink-0"
                      >
                        {product.status}
                      </Badge>
                    )}
                  </div>
                  {product.description && (
                    <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">
                      {product.description}
                    </p>
                  )}
                  <div className="mt-3 text-right text-sm">
                    <span className="font-medium">
                      {formatPrice(product.price, product.unit)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function ProductTableView({
  products,
  isOwner,
  onEditProduct,
  sortField,
  sortDirection,
  onSort,
}: {
  products: Product[]
  isOwner: boolean
  onEditProduct?: (product: Product) => void
  sortField: SortField | null
  sortDirection: SortDirection
  onSort: (field: SortField) => void
}) {
  function renderSortIcon(field: SortField) {
    if (sortField !== field) return null
    return sortDirection === 'asc' ? (
      <ArrowUp className="ml-1 h-3 w-3" />
    ) : (
      <ArrowDown className="ml-1 h-3 w-3" />
    )
  }

  function renderSortableHeader(label: string, field: SortField) {
    return (
      <button
        type="button"
        className="inline-flex items-center font-medium hover:text-foreground"
        onClick={() => onSort(field)}
      >
        {label}
        {renderSortIcon(field)}
      </button>
    )
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Package className="h-12 w-12 text-muted-foreground/50" />
        <p className="mt-4 text-sm text-muted-foreground">
          {isOwner
            ? 'Add your first product to get started.'
            : 'This supplier has no products yet.'}
        </p>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{renderSortableHeader('Name', 'name')}</TableHead>
          <TableHead>{renderSortableHeader('Category', 'category')}</TableHead>
          <TableHead>{renderSortableHeader('Price', 'price')}</TableHead>
          <TableHead>{renderSortableHeader('Status', 'status')}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map((product) => (
          <TableRow
            key={product.id}
            className={isOwner && onEditProduct ? 'cursor-pointer' : undefined}
            onClick={
              isOwner && onEditProduct
                ? () => onEditProduct(product)
                : undefined
            }
          >
            <TableCell className="font-medium">{product.name}</TableCell>
            <TableCell className="text-muted-foreground">
              {product.category ?? '-'}
            </TableCell>
            <TableCell>{formatPrice(product.price, product.unit)}</TableCell>
            <TableCell>
              {product.status !== 'active' && (
                <Badge variant={statusBadgeVariant(product.status)}>
                  {product.status}
                </Badge>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export function ProductList({
  products,
  isPending,
  isOwner,
  onAddProduct,
  onEditProduct,
}: {
  products: Product[]
  isPending: boolean
  isOwner: boolean
  onAddProduct?: () => void
  onEditProduct?: (product: Product) => void
}) {
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<ProductFilters>({
    statuses: new Set(),
    categories: new Set(),
  })
  const [sortField, setSortField] = useState<SortField | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  const filterOptions = useMemo(() => {
    const statusSet = new Set<string>(['active', 'archived'])
    const categorySet = new Set<string>()
    for (const product of products) {
      statusSet.add(product.status)
      if (product.category) categorySet.add(product.category)
    }
    return {
      statuses: Array.from(statusSet).sort(),
      categories: Array.from(categorySet).sort(),
    }
  }, [products])

  const hasActiveFilters =
    filters.statuses.size > 0 || filters.categories.size > 0

  function toggleFilter(type: keyof ProductFilters, value: string) {
    setFilters((prev) => {
      const next = new Set(prev[type])
      if (next.has(value)) {
        next.delete(value)
      } else {
        next.add(value)
      }
      return { ...prev, [type]: next }
    })
  }

  function clearFilters() {
    setFilters({ statuses: new Set(), categories: new Set() })
  }

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const filteredProducts = useMemo(() => {
    let result = products

    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q),
      )
    }

    if (filters.statuses.size > 0) {
      result = result.filter((p) => filters.statuses.has(p.status))
    }
    if (filters.categories.size > 0) {
      result = result.filter(
        (p) => p.category && filters.categories.has(p.category),
      )
    }

    if (sortField) {
      result = [...result].sort((a, b) => {
        let cmp = 0
        switch (sortField) {
          case 'name':
            cmp = a.name.localeCompare(b.name)
            break
          case 'category':
            cmp = (a.category ?? '').localeCompare(b.category ?? '')
            break
          case 'price': {
            const aPrice = a.price ? Number(a.price) : 0
            const bPrice = b.price ? Number(b.price) : 0
            cmp = aPrice - bPrice
            break
          }
          case 'status':
            cmp = a.status.localeCompare(b.status)
            break
        }
        return sortDirection === 'desc' ? -cmp : cmp
      })
    }

    return result
  }, [products, searchQuery, filters, sortField, sortDirection])

  if (isPending) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Products</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {products.length === 0
              ? 'No products yet'
              : `${products.length} product${products.length === 1 ? '' : 's'}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() =>
                    setViewMode((v) => (v === 'grid' ? 'table' : 'grid'))
                  }
                >
                  {viewMode === 'grid' ? (
                    <TableIcon className="h-4 w-4" />
                  ) : (
                    <LayoutGrid className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Switch to {viewMode === 'grid' ? 'table' : 'grid'} view
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="inline-flex">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    disabled
                  >
                    <Printer className="h-4 w-4" />
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent>Coming soon</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          {isOwner && (
            <Button size="sm" onClick={onAddProduct}>
              <Plus className="h-4 w-4" />
              Add Product
            </Button>
          )}
        </div>
      </div>

      <Separator className="my-6" />

      {/* Toolbar: search + filter */}
      <div className="mb-4 flex items-center gap-3">
        <div className="relative w-64">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 pl-8 text-sm"
          />
        </div>

        <div className="flex-1" />

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative h-8 w-8">
              <ListFilter className="h-4 w-4" />
              {hasActiveFilters && (
                <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-blue-500" />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-56 p-0">
            <div className="p-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium">Filters</p>
                {hasActiveFilters && (
                  <button
                    type="button"
                    className="text-xs text-muted-foreground hover:text-foreground"
                    onClick={clearFilters}
                  >
                    Clear all
                  </button>
                )}
              </div>
            </div>

            {filterOptions.statuses.length > 0 && (
              <div className="border-t p-3">
                <p className="mb-2 text-xs font-medium text-muted-foreground">
                  Status
                </p>
                <div className="flex flex-col gap-1.5">
                  {filterOptions.statuses.map((status) => (
                    <button
                      key={status}
                      type="button"
                      className="flex items-center gap-2 rounded px-1 py-0.5 text-xs hover:bg-accent"
                      onClick={() => toggleFilter('statuses', status)}
                    >
                      <div
                        className={cn(
                          'flex h-4 w-4 items-center justify-center rounded border',
                          filters.statuses.has(status)
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-input',
                        )}
                      >
                        {filters.statuses.has(status) && (
                          <Check className="h-3 w-3" />
                        )}
                      </div>
                      <span className="capitalize">{status}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {filterOptions.categories.length > 0 && (
              <div className="border-t p-3">
                <p className="mb-2 text-xs font-medium text-muted-foreground">
                  Category
                </p>
                <div className="flex flex-col gap-1.5">
                  {filterOptions.categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      className="flex items-center gap-2 rounded px-1 py-0.5 text-xs hover:bg-accent"
                      onClick={() => toggleFilter('categories', cat)}
                    >
                      <div
                        className={cn(
                          'flex h-4 w-4 items-center justify-center rounded border',
                          filters.categories.has(cat)
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-input',
                        )}
                      >
                        {filters.categories.has(cat) && (
                          <Check className="h-3 w-3" />
                        )}
                      </div>
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </PopoverContent>
        </Popover>
      </div>

      {viewMode === 'grid' ? (
        <ProductCardGrid
          products={filteredProducts}
          isOwner={isOwner}
          onEditProduct={onEditProduct}
        />
      ) : (
        <ProductTableView
          products={filteredProducts}
          isOwner={isOwner}
          onEditProduct={onEditProduct}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={handleSort}
        />
      )}
    </div>
  )
}
