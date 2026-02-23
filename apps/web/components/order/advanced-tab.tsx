'use client'

import { Archive, Copy } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { trpc } from '@/lib/trpc'

interface AdvancedTabProps {
  orderId: string
  onOrderArchived?: () => void
}

export function AdvancedTab({ orderId, onOrderArchived }: AdvancedTabProps) {
  const router = useRouter()
  const utils = trpc.useUtils()

  const archiveMutation = trpc.order.archive.useMutation({
    onSuccess() {
      toast.success('Order archived')
      void utils.order.list.invalidate()
      onOrderArchived?.()
      router.push('/dashboard')
    },
    onError(error) {
      toast.error(error.message || 'Failed to archive order')
    },
  })

  const duplicateMutation = trpc.order.duplicate.useMutation({
    onSuccess(data) {
      toast.success('Order duplicated')
      void utils.order.list.invalidate()
      router.push(`/order/${data.orderId}`)
    },
    onError(error) {
      toast.error(error.message || 'Failed to duplicate order')
    },
  })

  return (
    <div className="flex h-full flex-col p-6">
      <h2 className="text-lg font-semibold">Advanced</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Manage this order with advanced options.
      </p>

      <Separator className="my-6" />

      {/* Duplicate */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Duplicate order</h3>
        <p className="text-sm text-muted-foreground">
          Create a new draft order with the same items. The original order is
          not affected.
        </p>
        <Button
          variant="outline"
          className="gap-2"
          disabled={duplicateMutation.isPending}
          onClick={() => duplicateMutation.mutate({ orderId })}
        >
          <Copy className="h-4 w-4" />
          {duplicateMutation.isPending ? 'Duplicating...' : 'Duplicate'}
        </Button>
      </div>

      <Separator className="my-6" />

      {/* Archive */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Archive order</h3>
        <p className="text-sm text-muted-foreground">
          Archived orders are hidden from the dashboard. This action cannot be
          undone.
        </p>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="destructive"
              className="gap-2"
              disabled={archiveMutation.isPending}
            >
              <Archive className="h-4 w-4" />
              {archiveMutation.isPending ? 'Archiving...' : 'Archive'}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Archive this order?</AlertDialogTitle>
              <AlertDialogDescription>
                This order will be hidden from the dashboard and cannot be
                restored. Any pending items will remain unchanged.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => archiveMutation.mutate({ orderId })}
              >
                Archive
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
