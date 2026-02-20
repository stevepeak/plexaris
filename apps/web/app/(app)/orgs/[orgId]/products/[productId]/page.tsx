'use client'

import { Bot } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

import { ProductForm } from '@/components/product-form'
import { ProductVersionHistory } from '@/components/product-version-history'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

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
  const [isActivating, setIsActivating] = useState(false)
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

  const handleActivate = useCallback(async () => {
    setIsActivating(true)
    const res = await fetch(`/api/products/${productId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'active', note: 'Activated from draft' }),
    })
    if (res.ok) {
      setProduct((prev) => (prev ? { ...prev, status: 'active' } : prev))
    }
    setIsActivating(false)
  }, [productId])

  const handleCancel = useCallback(() => {
    router.push(`/orgs/${orgId}?tab=products`)
  }, [orgId, router])

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {product?.status === 'draft' && (
        <Alert className="mb-6">
          <Bot className="h-4 w-4" />
          <AlertTitle>Draft product</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>
              This product was discovered by an AI agent. Review the details and
              activate it when ready.
            </span>
            <Button size="sm" onClick={handleActivate} disabled={isActivating}>
              {isActivating ? 'Activating...' : 'Activate product'}
            </Button>
          </AlertDescription>
        </Alert>
      )}
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
