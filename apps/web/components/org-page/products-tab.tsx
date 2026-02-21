'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

import { type Product, ProductList } from '@/components/product-list'

export function ProductsTab({
  organizationId,
  permissions,
}: {
  organizationId: string
  permissions: string[]
}) {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [isPending, setIsPending] = useState(false)

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

  return (
    <ProductList
      products={products}
      isPending={isPending}
      permissions={permissions}
      onAddProduct={() => router.push(`/orgs/${organizationId}/products/new`)}
      onEditProduct={(p) =>
        router.push(`/orgs/${organizationId}/products/${p.id}`)
      }
    />
  )
}
