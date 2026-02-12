'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

import { type Product, ProductList } from '@/components/product-list'

export function ProductsTab({
  organizationId,
  isOwner,
  initialProductId,
}: {
  organizationId: string
  isOwner: boolean
  initialProductId?: string | null
}) {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [isPending, setIsPending] = useState(false)
  const [consumedProductId, setConsumedProductId] = useState(false)

  const refreshProducts = useCallback(() => {
    setIsPending(true)
    void fetch(`/api/products?organizationId=${organizationId}`)
      .then((res) => (res.ok ? res.json() : { products: [] }))
      .then((data) => setProducts(data.products ?? []))
      .finally(() => setIsPending(false))
  }, [organizationId])

  useEffect(() => {
    refreshProducts()
  }, [refreshProducts])

  // Deep-link: auto-navigate to product editor when initialProductId is set
  useEffect(() => {
    if (initialProductId && !consumedProductId) {
      setConsumedProductId(true)
      router.push(`/orgs/${organizationId}/products/${initialProductId}`)
    }
  }, [initialProductId, consumedProductId, organizationId, router])

  return (
    <ProductList
      products={products}
      isPending={isPending}
      isOwner={isOwner}
      onAddProduct={() => router.push(`/orgs/${organizationId}/products/new`)}
      onEditProduct={(p) =>
        router.push(`/orgs/${organizationId}/products/${p.id}`)
      }
    />
  )
}
