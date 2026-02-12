'use client'

import { useParams, useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

import { ProductForm } from '@/components/product-form'
import { ProductVersionHistory } from '@/components/product-version-history'

type ProductData = {
  id: string
  name: string
  description: string | null
  price: string | null
  unit: string | null
  category: string | null
  status: string
  data?: Record<string, unknown> | null
}

export default function ProductEditPage() {
  const { orgId, productId } = useParams<{ orgId: string; productId: string }>()
  const router = useRouter()

  const [product, setProduct] = useState<ProductData | null>(null)
  const [isPending, setIsPending] = useState(true)
  const [view, setView] = useState<'edit' | 'history'>('edit')

  useEffect(() => {
    setIsPending(true)
    void fetch(`/api/products/${productId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.product) setProduct(data.product)
      })
      .finally(() => setIsPending(false))
  }, [productId])

  const handleUpdate = useCallback(
    async (data: {
      name: string
      category: string
      note?: string
      data?: Record<string, unknown>
    }): Promise<{ error?: string }> => {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const json = await res.json()
        return { error: json.error ?? 'Failed to update product' }
      }
      router.push(`/orgs/${orgId}?tab=products`)
      return {}
    },
    [productId, orgId, router],
  )

  const handleCancel = useCallback(() => {
    router.push(`/orgs/${orgId}?tab=products`)
  }, [orgId, router])

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {view === 'history' ? (
        <ProductVersionHistory
          productId={productId}
          onBack={() => setView('edit')}
        />
      ) : (
        <ProductForm
          productId={productId}
          product={product}
          onSubmit={handleUpdate}
          onCancel={handleCancel}
          onViewHistory={() => setView('history')}
          isPending={isPending}
        />
      )}
    </div>
  )
}
