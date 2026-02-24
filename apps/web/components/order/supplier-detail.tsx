'use i18n'
'use client'

import { Mail, MapPin, Package, Phone, Star, Store } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'

interface SupplierProduct {
  id: string
  name: string
  price: string | null
  unit: string | null
  category: string | null
}

interface SupplierData {
  id: string
  name: string
  description: string | null
  phone: string | null
  email: string | null
  address: string | null
  deliveryAreas: string | null
  products: SupplierProduct[]
}

interface SupplierDetailProps {
  supplierId: string
  onOpenProduct: (productId: string, productName: string) => void
  organizationId?: string | null
  onFavoriteToggled?: () => void
}

export function SupplierDetail({
  supplierId,
  onOpenProduct,
  organizationId,
  onFavoriteToggled,
}: SupplierDetailProps) {
  const [supplier, setSupplier] = useState<SupplierData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFavorited, setIsFavorited] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setIsLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/supplier/${supplierId}`)
        if (!res.ok) {
          setError('Supplier not found')
          return
        }
        const data = await res.json()
        if (!cancelled) {
          setSupplier({ ...data.supplier, products: data.products })
        }
      } catch {
        if (!cancelled) {
          setError('Failed to load supplier')
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
  }, [supplierId])

  // Check favorite status when supplier and org are available
  useEffect(() => {
    if (!organizationId || !supplierId) return
    let cancelled = false

    async function checkFavorite() {
      const params = new URLSearchParams({
        organizationId: organizationId!,
        targetType: 'supplier',
      })
      const res = await fetch(`/api/favorites?${params.toString()}`)
      if (res.ok && !cancelled) {
        const data = await res.json()
        const ids = new Set(
          (data.favorites as { id: string }[]).map((f) => f.id),
        )
        setIsFavorited(ids.has(supplierId))
      }
    }

    void checkFavorite()
    return () => {
      cancelled = true
    }
  }, [organizationId, supplierId])

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
          targetType: 'supplier',
          targetId: supplierId,
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
  }, [organizationId, supplierId, isFavorited, onFavoriteToggled])

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 p-6">
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-20 w-full" />
      </div>
    )
  }

  if (error || !supplier) {
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
            <Store className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold">{supplier.name}</h2>
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

        {supplier.description && (
          <p className="text-sm text-muted-foreground">
            {supplier.description}
          </p>
        )}

        <div className="flex flex-col gap-2 text-sm">
          {supplier.phone && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-3.5 w-3.5" />
              {supplier.phone}
            </div>
          )}
          {supplier.email && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-3.5 w-3.5" />
              {supplier.email}
            </div>
          )}
          {supplier.address && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              {supplier.address}
            </div>
          )}
          {supplier.deliveryAreas && (
            <div className="text-muted-foreground">
              <span className="font-medium">Delivery areas:</span>{' '}
              {supplier.deliveryAreas}
            </div>
          )}
        </div>

        {supplier.products.length > 0 && (
          <>
            <Separator />
            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium uppercase text-muted-foreground">
                Products ({supplier.products.length})
              </span>
              <div className="flex flex-col gap-1">
                {supplier.products.map((product) => (
                  <Button
                    key={product.id}
                    variant="ghost"
                    className="h-auto justify-start gap-2 py-2"
                    onClick={() => onOpenProduct(product.id, product.name)}
                  >
                    <Package className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{product.name}</span>
                    {product.price != null && (
                      <Badge
                        variant="secondary"
                        className="ml-auto font-normal"
                      >
                        {product.price}
                        {product.unit ? `/${product.unit}` : ''}
                      </Badge>
                    )}
                  </Button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </ScrollArea>
  )
}
