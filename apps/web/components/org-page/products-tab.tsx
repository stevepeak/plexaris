'use client'

import { useCallback, useEffect, useState } from 'react'

import { ProductForm } from '@/components/product-form'
import { type Product, ProductList } from '@/components/product-list'

export function ProductsTab({
  organizationId,
  isOwner,
}: {
  organizationId: string
  isOwner: boolean
}) {
  const [products, setProducts] = useState<Product[]>([])
  const [isPending, setIsPending] = useState(false)
  const [productView, setProductView] = useState<
    'list' | 'add' | { editing: Product }
  >('list')

  const refreshProducts = useCallback(() => {
    setIsPending(true)
    void fetch(`/api/products?organizationId=${organizationId}`)
      .then((res) => (res.ok ? res.json() : { products: [] }))
      .then((data) => setProducts(data.products ?? []))
      .finally(() => setIsPending(false))
  }, [organizationId])

  useEffect(() => {
    setProductView('list')
    refreshProducts()
  }, [refreshProducts])

  const handleCreateProduct = async (data: {
    name: string
    description: string
    price: string
    unit: string
    category: string
  }): Promise<{ error?: string }> => {
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, organizationId }),
    })
    if (!res.ok) {
      const json = await res.json()
      return { error: json.error ?? 'Failed to create product' }
    }
    refreshProducts()
    setProductView('list')
    return {}
  }

  const handleUpdateProduct = async (
    productId: string,
    data: {
      name: string
      description: string
      price: string
      unit: string
      category: string
    },
  ): Promise<{ error?: string }> => {
    const res = await fetch(`/api/products/${productId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      const json = await res.json()
      return { error: json.error ?? 'Failed to update product' }
    }
    refreshProducts()
    setProductView('list')
    return {}
  }

  if (productView === 'add') {
    return (
      <ProductForm
        onSubmit={handleCreateProduct}
        onCancel={() => setProductView('list')}
      />
    )
  }

  if (productView !== 'list' && 'editing' in productView) {
    return (
      <ProductForm
        product={productView.editing}
        onSubmit={(data) => handleUpdateProduct(productView.editing.id, data)}
        onCancel={() => setProductView('list')}
      />
    )
  }

  return (
    <ProductList
      products={products}
      isPending={isPending}
      isOwner={isOwner}
      onAddProduct={() => setProductView('add')}
      onEditProduct={(p) => setProductView({ editing: p })}
    />
  )
}
