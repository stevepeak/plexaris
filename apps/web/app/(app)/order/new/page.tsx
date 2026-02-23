'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { toast } from 'sonner'

import { useActiveOrg } from '@/components/org-switcher'
import { Skeleton } from '@/components/ui/skeleton'
import { trpc } from '@/lib/trpc'

export default function NewOrderPage() {
  const router = useRouter()
  const { activeOrg, isPending: orgsPending } = useActiveOrg()
  const createOrder = trpc.order.create.useMutation()
  const creatingRef = useRef(false)

  useEffect(() => {
    if (orgsPending || !activeOrg || creatingRef.current) return
    creatingRef.current = true

    createOrder.mutate(
      { organizationId: activeOrg.id },
      {
        onSuccess: (data) => {
          router.replace(`/order/${data.orderId}`)
        },
        onError: (error) => {
          toast.error(error.message || 'Failed to create order')
        },
      },
    )
  }, [activeOrg, orgsPending, createOrder, router])

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <Skeleton className="h-8 w-48" />
        <p className="text-sm text-muted-foreground">Creating new order...</p>
      </div>
    </div>
  )
}
