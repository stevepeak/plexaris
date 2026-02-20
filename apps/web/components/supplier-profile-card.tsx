'use client'

import { Building2, Mail, MapPin, Package, Phone } from 'lucide-react'
import { useMemo, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { parseCategoryValue } from '@/lib/product-categories'

interface SupplierProfile {
  id: string
  name: string
  type: string
  claimed: boolean
  description: string | null
  logoUrl: string | null
  phone: string | null
  email: string | null
  address: string | null
  deliveryAreas: string | null
}

export interface SupplierProduct {
  id: string
  name: string
  description: string | null
  price: string | null
  unit: string | null
  category: string | null
  status: string
}

export type SupplierProfileCardState =
  | { status: 'loading' }
  | { status: 'loaded'; supplier: SupplierProfile }
  | { status: 'error'; message: string }

interface SupplierProfileCardProps {
  state: SupplierProfileCardState
  products?: SupplierProduct[]
}

function formatPrice(price: string | null, unit: string | null) {
  if (price == null) return null
  const formatted = new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
  }).format(Number(price))
  if (unit) return `${formatted} / ${unit}`
  return formatted
}

function ProductCard({ product }: { product: SupplierProduct }) {
  const price = formatPrice(product.price, product.unit)

  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-start justify-between gap-2">
        <h4 className="font-medium">{product.name}</h4>
        {price && <span className="shrink-0 text-sm font-medium">{price}</span>}
      </div>
      {product.description && (
        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
          {product.description}
        </p>
      )}
      {product.category && (
        <Badge variant="outline" className="mt-2">
          {product.category}
        </Badge>
      )}
    </div>
  )
}

function ProductsSection({ products }: { products: SupplierProduct[] }) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const categories = useMemo(() => {
    const cats = new Set<string>()
    for (const p of products) {
      if (p.category) cats.add(parseCategoryValue(p.category).primary)
    }
    return Array.from(cats).sort()
  }, [products])

  const filtered = activeCategory
    ? products.filter(
        (p) =>
          p.category !== null &&
          parseCategoryValue(p.category).primary === activeCategory,
      )
    : products

  return (
    <div className="grid gap-3">
      <h3 className="text-sm font-medium">Products ({products.length})</h3>
      {categories.length > 1 && (
        <div className="flex flex-wrap gap-2">
          <Button
            variant={activeCategory === null ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveCategory(null)}
          >
            All
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={activeCategory === cat ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </Button>
          ))}
        </div>
      )}
      <div className="grid gap-3">
        {filtered.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}

export function SupplierProfileCard({
  state,
  products,
}: SupplierProfileCardProps) {
  if (state.status === 'loading') {
    return (
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-start gap-4">
            <Skeleton className="h-16 w-16 rounded-lg" />
            <div className="grid gap-2">
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-5 w-20" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <div className="grid gap-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-56" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (state.status === 'error') {
    return (
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Building2 className="h-6 w-6 text-muted-foreground" />
          </div>
          <CardTitle className="text-xl">Supplier not found</CardTitle>
          <p className="text-sm text-muted-foreground">{state.message}</p>
        </CardHeader>
      </Card>
    )
  }

  const { supplier } = state
  const hasContactInfo = supplier.email || supplier.phone || supplier.address
  const hasProducts = products && products.length > 0

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <div className="flex items-start gap-4">
          {supplier.logoUrl ? (
            <img
              src={supplier.logoUrl}
              alt={`${supplier.name} logo`}
              className="h-16 w-16 shrink-0 rounded-lg border object-cover"
            />
          ) : (
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-muted">
              <Building2 className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
          <div className="grid gap-1">
            <CardTitle className="text-2xl">{supplier.name}</CardTitle>
            <div className="flex gap-2">
              <Badge variant="secondary">{supplier.type}</Badge>
              {!supplier.claimed && <Badge variant="outline">Unclaimed</Badge>}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid gap-6">
        {supplier.description && (
          <p className="text-muted-foreground">{supplier.description}</p>
        )}

        {hasContactInfo && (
          <div className="grid gap-3">
            <h3 className="text-sm font-medium">Contact Information</h3>
            <div className="grid gap-2 text-sm">
              {supplier.email && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4 shrink-0" />
                  <span>{supplier.email}</span>
                </div>
              )}
              {supplier.phone && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4 shrink-0" />
                  <span>{supplier.phone}</span>
                </div>
              )}
              {supplier.address && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4 shrink-0" />
                  <span>{supplier.address}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {supplier.deliveryAreas && (
          <div className="grid gap-3">
            <h3 className="text-sm font-medium">Delivery Areas</h3>
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{supplier.deliveryAreas}</span>
            </div>
          </div>
        )}

        {hasProducts ? (
          <ProductsSection products={products} />
        ) : (
          <div className="grid gap-3">
            <h3 className="text-sm font-medium">Products</h3>
            <div className="flex flex-col items-center py-6 text-center">
              <Package className="h-8 w-8 text-muted-foreground/50" />
              <p className="mt-2 text-sm text-muted-foreground">
                No products listed yet.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
