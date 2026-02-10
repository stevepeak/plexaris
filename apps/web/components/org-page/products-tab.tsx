'use client'

import { useCallback, useEffect, useState } from 'react'

import { ProductForm } from '@/components/product-form'
import { type Product, ProductList } from '@/components/product-list'
import { ProductVersionHistory } from '@/components/product-version-history'

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
    'list' | 'add' | { editing: Product } | { history: Product }
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
    category: string
    data?: Record<string, unknown>
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
      category: string
      note?: string
      data?: Record<string, unknown>
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

  if (productView !== 'list' && 'history' in productView) {
    return (
      <ProductVersionHistory
        productId={productView.history.id}
        onBack={() => setProductView({ editing: productView.history })}
      />
    )
  }

  if (productView !== 'list' && 'editing' in productView) {
    return (
      <div className="space-y-4">
        <ProductForm
          product={productView.editing}
          onSubmit={(data) => handleUpdateProduct(productView.editing.id, data)}
          onCancel={() => setProductView('list')}
        />
        <button
          type="button"
          className="text-sm text-muted-foreground hover:text-foreground"
          onClick={() => setProductView({ history: productView.editing })}
        >
          View version history
        </button>
      </div>
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
