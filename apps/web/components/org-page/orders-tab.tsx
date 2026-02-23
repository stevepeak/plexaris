'use client'

import Link from 'next/link'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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

const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })

function formatRelativeTime(date: Date) {
  const now = Date.now()
  const diffMs = date.getTime() - now
  const diffSec = Math.round(diffMs / 1000)
  const diffMin = Math.round(diffSec / 60)
  const diffHr = Math.round(diffMin / 60)
  const diffDay = Math.round(diffHr / 24)

  if (Math.abs(diffSec) < 60) return rtf.format(diffSec, 'second')
  if (Math.abs(diffMin) < 60) return rtf.format(diffMin, 'minute')
  if (Math.abs(diffHr) < 24) return rtf.format(diffHr, 'hour')
  if (Math.abs(diffDay) < 30) return rtf.format(diffDay, 'day')
  return date.toLocaleDateString()
}

const PLACEHOLDER_ORDERS = [
  {
    number: 14,
    status: 'Confirmed',
    items: [
      { name: 'Organic Whole Milk 1L', qty: 12, price: 2.4 },
      { name: 'Sourdough Loaf', qty: 6, price: 4.5 },
      { name: 'Free-Range Eggs (30)', qty: 2, price: 8.9 },
    ],
    rotate: '-3deg',
    titleColor: 'text-blue-600 dark:text-blue-400',
  },
  {
    number: 15,
    status: 'Submitted',
    items: [
      { name: 'Espresso Beans 1kg', qty: 4, price: 18.0 },
      { name: 'Oat Milk Barista 1L', qty: 24, price: 3.2 },
    ],
    rotate: '2deg',
    titleColor: 'text-amber-600 dark:text-amber-400',
  },
  {
    number: 16,
    status: 'Draft',
    items: [
      { name: 'Atlantic Salmon Fillet', qty: 8, price: 12.5 },
      { name: 'Baby Spinach 250g', qty: 10, price: 3.0 },
      { name: 'Lemon (each)', qty: 15, price: 0.6 },
      { name: 'Olive Oil 500ml', qty: 3, price: 7.8 },
    ],
    rotate: '-1.5deg',
    titleColor: 'text-emerald-600 dark:text-emerald-400',
  },
] as const

export function OrdersTab({
  organizationId,
  orgType,
}: {
  organizationId: string
  orgType: string
}) {
  if (orgType === 'supplier') {
    return <SupplierOrders />
  }

  return <HorecaOrders organizationId={organizationId} />
}

function OrdersEmptyState({ message }: { message: string }) {
  return (
    <div className="relative">
      <div
        aria-hidden
        className="pointer-events-none flex select-none justify-center gap-6 overflow-hidden py-8"
      >
        {PLACEHOLDER_ORDERS.map((order) => (
          <Card
            key={order.number}
            className="w-64 shrink-0 opacity-70 shadow-md blur-[3px]"
            style={{ transform: `rotate(${order.rotate})` }}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle
                  className={`text-sm font-medium ${order.titleColor}`}
                >
                  Order #{order.number}
                </CardTitle>
                <Badge variant="outline" className="text-xs">
                  {order.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-1">
                {order.items.map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between text-xs text-muted-foreground"
                  >
                    <span className="truncate">
                      {item.qty}x {item.name}
                    </span>
                    <span className="ml-2 shrink-0">
                      ${(item.qty * item.price).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
              <Separator />
              <div className="flex items-center justify-between text-sm font-medium">
                <span>Total</span>
                <span>
                  $
                  {order.items
                    .reduce((sum, i) => sum + i.qty * i.price, 0)
                    .toFixed(2)}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="absolute inset-0 flex items-center justify-center bg-background/40">
        <p className="text-sm font-medium text-muted-foreground">{message}</p>
      </div>
    </div>
  )
}

function SupplierOrders() {
  return (
    <div>
      <div>
        <h2 className="text-lg font-semibold">Orders</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Orders placed by customers for your products
        </p>
      </div>
      <Separator className="my-6" />
      <OrdersEmptyState message="No orders received yet" />
    </div>
  )
}

function HorecaOrders({ organizationId }: { organizationId: string }) {
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
        <OrdersEmptyState message="No orders placed yet" />
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
                  <span className="font-mono text-sm font-medium">
                    #{order.orderNumber}
                  </span>
                  <Badge variant={config.variant}>{config.label}</Badge>
                  <span className="text-sm">
                    {order.itemCount} {order.itemCount === 1 ? 'item' : 'items'}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    by
                    <Avatar className="h-4 w-4">
                      <AvatarImage src={order.createdByImage ?? undefined} />
                      <AvatarFallback className="text-[8px]">
                        {order.createdByName
                          ?.split(' ')
                          .map((n) => n[0])
                          .join('')
                          .slice(0, 2)
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {order.createdByName}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatRelativeTime(new Date(order.updatedAt))}
                </span>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
