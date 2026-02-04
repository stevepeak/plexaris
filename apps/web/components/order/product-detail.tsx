'use client'

import {
  Apple,
  Beef,
  Croissant,
  CupSoda,
  Egg,
  Fish,
  type LucideIcon,
  Milk,
  Package,
  Star,
  Store,
  Wheat,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  Bread: Wheat,
  Pastry: Croissant,
  Dairy: Milk,
  Meat: Beef,
  Fish,
  Produce: Apple,
  Beverages: CupSoda,
  Ingredients: Egg,
}

interface ProductData {
  id: string
  name: string
  description: string | null
  price: string | null
  unit: string | null
  category: string | null
  status: string
  images: string[]
  supplier: { id: string; name: string }
}

interface ProductDetailProps {
  productId: string
  onOpenSupplier: (supplierId: string, supplierName: string) => void
  organizationId?: string | null
  onFavoriteToggled?: () => void
}

export function ProductDetail({
  productId,
  onOpenSupplier,
  organizationId,
  onFavoriteToggled,
}: ProductDetailProps) {
  const [product, setProduct] = useState<ProductData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFavorited, setIsFavorited] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setIsLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/products/${productId}`)
        if (!res.ok) {
          setError('Product not found')
          return
        }
        const data = await res.json()
        if (!cancelled) {
          setProduct(data.product)
        }
      } catch {
        if (!cancelled) {
          setError('Failed to load product')
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [productId])

  // Check favorite status when product and org are available
  useEffect(() => {
    if (!organizationId || !productId) return
    let cancelled = false

    async function checkFavorite() {
      const params = new URLSearchParams({
        organizationId: organizationId!,
        targetType: 'product',
      })
      const res = await fetch(`/api/favorites?${params.toString()}`)
      if (res.ok && !cancelled) {
        const data = await res.json()
        const ids = new Set(
          (data.favorites as { id: string }[]).map((f) => f.id),
        )
        setIsFavorited(ids.has(productId))
      }
    }

    void checkFavorite()
    return () => {
      cancelled = true
    }
  }, [organizationId, productId])

  const toggleFavorite = useCallback(async () => {
    if (!organizationId) return
    const prev = isFavorited
    setIsFavorited(!prev)
    try {
      const res = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId,
          targetType: 'product',
          targetId: productId,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        setIsFavorited(data.favorited)
        onFavoriteToggled?.()
      } else {
        setIsFavorited(prev)
      }
    } catch {
      setIsFavorited(prev)
    }
  }, [organizationId, productId, isFavorited, onFavoriteToggled])

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 p-6">
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-20 w-full" />
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <p className="text-sm text-muted-foreground">{error ?? 'Not found'}</p>
      </div>
    )
  }

  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col gap-6 p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted">
            <Package className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="flex flex-col gap-1">
            {product.category && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                {(() => {
                  const Icon = CATEGORY_ICONS[product.category]
                  return Icon ? <Icon className="h-3 w-3" /> : null
                })()}
                {product.category}
              </span>
            )}
            <h2 className="text-lg font-semibold">{product.name}</h2>
          </div>
          {organizationId && (
            <button
              type="button"
              className="ml-auto shrink-0"
              onClick={toggleFavorite}
            >
              <Star
                className={`h-5 w-5 ${isFavorited ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground'}`}
              />
            </button>
          )}
        </div>

        {product.description && (
          <p className="text-sm text-muted-foreground">{product.description}</p>
        )}

        <div className="flex flex-col gap-2">
          {product.price != null && (
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-semibold">{product.price}</span>
              {product.unit && (
                <span className="text-sm text-muted-foreground">
                  / {product.unit}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium uppercase text-muted-foreground">
            Supplier
          </span>
          <Button
            variant="outline"
            className="justify-start gap-2"
            onClick={() =>
              onOpenSupplier(product.supplier.id, product.supplier.name)
            }
          >
            <Store className="h-4 w-4" />
            {product.supplier.name}
          </Button>
        </div>
      </div>
    </ScrollArea>
  )
}
