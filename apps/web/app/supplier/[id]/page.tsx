'use client'

import { useParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

import {
  type SupplierProduct,
  SupplierProfileCard,
  type SupplierProfileCardState,
} from '@/components/supplier-profile-card'

export default function SupplierProfilePage() {
  const { id } = useParams<{ id: string }>()
  const [state, setState] = useState<SupplierProfileCardState>({
    status: 'loading',
  })
  const [products, setProducts] = useState<SupplierProduct[]>([])

  const fetchSupplier = useCallback(async () => {
    const res = await fetch(`/api/supplier/${id}`)
    if (!res.ok) {
      const body = await res.json()
      setState({
        status: 'error',
        message: body.error ?? 'Something went wrong',
      })
      return
    }
    const data = await res.json()
    setState({ status: 'loaded', supplier: data.supplier })
    setProducts(data.products ?? [])
  }, [id])

  useEffect(() => {
    void fetchSupplier()
  }, [fetchSupplier])

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <SupplierProfileCard state={state} products={products} />
    </div>
  )
}
