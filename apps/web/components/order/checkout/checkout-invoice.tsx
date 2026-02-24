'use i18n'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'

import { type CartItemData } from '../cart-item'

interface CheckoutInvoiceProps {
  orderNumber: number
  items: CartItemData[]
  subtotal: number
  isPaid: boolean
  createdAt?: Date
  submittedAt?: Date | null
}

function formatDate(date: Date) {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function CheckoutInvoice({
  orderNumber,
  items,
  subtotal,
  isPaid,
  createdAt,
  submittedAt,
}: CheckoutInvoiceProps) {
  const displayDate = submittedAt
    ? formatDate(submittedAt)
    : createdAt
      ? formatDate(createdAt)
      : formatDate(new Date())

  return (
    <div className="flex h-full items-center justify-center bg-gradient-to-br from-muted/30 to-muted/10 p-8">
      {/* Grid pattern overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Invoice card */}
      <div className="relative w-full max-w-2xl rounded-xl border bg-card shadow-lg">
        <ScrollArea className="max-h-[calc(100vh-12rem)]">
          <div className="p-8">
            {/* Header */}
            <div className="mb-8 flex items-start justify-between">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">INVOICE</h2>
                <p className="text-muted-foreground mt-1 font-mono text-sm">
                  #{orderNumber}
                </p>
              </div>
              <div className="text-right">
                <p className="text-muted-foreground text-sm">Date</p>
                <p className="font-medium">{displayDate}</p>
              </div>
            </div>

            <Separator className="mb-6" />

            {/* Line items table */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50%]">Item</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="text-right">
                      {item.quantity}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-right">
                      ${item.price.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      ${(item.quantity * item.price).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Footer */}
            <Separator className="mt-4" />
            <div className="mt-4 flex justify-end">
              <div className="w-48 space-y-2">
                <div className="flex justify-between text-lg font-bold">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* PAID stamp overlay */}
        <div
          className={cn(
            'pointer-events-none absolute inset-0 flex items-center justify-center',
            !isPaid && 'hidden',
          )}
        >
          <div
            className={cn(
              'rounded-lg border-4 border-green-500 px-8 py-3 text-5xl font-bold uppercase text-green-500 opacity-80',
              isPaid && 'animate-stamp',
            )}
          >
            PAID
          </div>
        </div>
      </div>
    </div>
  )
}
