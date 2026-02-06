'use client'

import Link from 'next/link'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { trpc } from '@/lib/trpc'

const statusConfig: Record<
  string,
  {
    label: string
    variant: 'default' | 'secondary' | 'outline' | 'destructive'
  }
> = {
  draft: { label: 'Draft', variant: 'secondary' },
  submitted: { label: 'Submitted', variant: 'default' },
  confirmed: { label: 'Confirmed', variant: 'outline' },
  delivered: { label: 'Delivered', variant: 'outline' },
  cancelled: { label: 'Cancelled', variant: 'destructive' },
}

export function OrdersTab({ organizationId }: { organizationId: string }) {
  const { data: orders, isPending } = trpc.order.list.useQuery({
    organizationId,
  })

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Orders</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Place and manage orders from your suppliers
          </p>
        </div>
        <Button asChild>
          <Link href="/order/new">New Order</Link>
        </Button>
      </div>
      <Separator className="my-6" />

      {isPending ? (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : !orders?.length ? (
        <p className="py-4 text-sm text-muted-foreground">
          No orders yet. Start a new order to browse products from your
          suppliers.
        </p>
      ) : (
        <div className="divide-y rounded-md border">
          {orders.map((order) => {
            const config = statusConfig[order.status] ?? statusConfig.draft
            return (
              <Link
                key={order.id}
                href={`/order/${order.id}`}
                className="flex items-center justify-between px-6 py-3 transition-colors hover:bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <Badge variant={config.variant}>{config.label}</Badge>
                  <span className="text-sm">
                    {order.itemCount} {order.itemCount === 1 ? 'item' : 'items'}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    by {order.createdByName}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(order.updatedAt).toLocaleDateString()}
                </span>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
