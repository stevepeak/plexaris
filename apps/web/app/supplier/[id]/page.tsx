'use client'

import { useParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

import {
  SupplierProfileCard,
  type SupplierProfileCardState,
} from '@/components/supplier-profile-card'

export default function SupplierProfilePage() {
  const { id } = useParams<{ id: string }>()
  const [state, setState] = useState<SupplierProfileCardState>({
    status: 'loading',
  })

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
  }, [id])

  useEffect(() => {
    void fetchSupplier()
  }, [fetchSupplier])

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <SupplierProfileCard state={state} />
    </div>
  )
}
