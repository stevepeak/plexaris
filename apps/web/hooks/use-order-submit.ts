'use client'

import { useCallback } from 'react'
import { toast } from 'sonner'

import { trpc } from '@/lib/trpc'

export function useOrderSubmit(orderId: string) {
  const utils = trpc.useUtils()

  const mutation = trpc.order.submit.useMutation({
    onSuccess: () => {
      void utils.order.get.invalidate({ orderId })
      void utils.order.list.invalidate()
      void utils.order.getEvents.invalidate({ orderId })
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to submit order')
    },
  })

  const submit = useCallback(
    (deliveryNotes: string) => {
      mutation.mutate({ orderId, deliveryNotes: deliveryNotes || undefined })
    },
    [orderId, mutation],
  )

  return {
    submit,
    isSubmitting: mutation.isPending,
    isSuccess: mutation.isSuccess,
  }
}
