'use client'

import { useParams, useRouter } from 'next/navigation'
import { useCallback } from 'react'

import { ProductForm } from '@/components/product-form'

export default function ProductNewPage() {
  const { orgId } = useParams<{ orgId: string }>()
  const router = useRouter()

  const handleCreate = useCallback(
    async (data: {
      name: string
      category: string
      data?: Record<string, unknown>
    }): Promise<{ error?: string }> => {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, organizationId: orgId }),
      })
      if (!res.ok) {
        const json = await res.json()
        return { error: json.error ?? 'Failed to create product' }
      }
      router.push(`/orgs/${orgId}?tab=products`)
      return {}
    },
    [orgId, router],
  )

  const handleCancel = useCallback(() => {
    router.push(`/orgs/${orgId}?tab=products`)
  }, [orgId, router])

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <ProductForm onSubmit={handleCreate} onCancel={handleCancel} />
    </div>
  )
}
