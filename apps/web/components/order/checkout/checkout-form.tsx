'use i18n'
import { Calendar, CreditCard, Loader2, ShieldAlert } from 'lucide-react'
import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'

interface CheckoutFormProps {
  hasPlaceOrderPermission: boolean
  isSubmitting: boolean
  onSubmit: (deliveryNotes: string) => void
  onBack: () => void
  subtotal: number
  itemCount: number
}

export function CheckoutForm({
  hasPlaceOrderPermission,
  isSubmitting,
  onSubmit,
  onBack,
  subtotal,
  itemCount,
}: CheckoutFormProps) {
  const [deliveryNotes, setDeliveryNotes] = useState('')

  return (
    <ScrollArea className="h-full">
      <div className="space-y-6 p-6">
        {/* Section 1 — Delivery Instructions */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Delivery Notes</label>
          <Textarea
            value={deliveryNotes}
            onChange={(e) => setDeliveryNotes(e.target.value)}
            placeholder="Add any special delivery instructions, gate codes, or notes for the supplier..."
            rows={4}
          />
        </div>

        <Separator />

        {/* Section 2 — Expected Delivery Date */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Expected Delivery</label>
          <div className="relative rounded-lg border p-4 opacity-50">
            <div className="flex items-center gap-3">
              <Calendar className="text-muted-foreground size-5" />
              <div className="flex-1">
                <p className="text-sm font-medium">
                  Schedule delivery windows and set expected dates
                </p>
              </div>
              <Badge variant="secondary">Coming soon</Badge>
            </div>
          </div>
        </div>

        {/* Section 3 — Payment Method */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Payment Method</label>
          <div className="relative rounded-lg border p-4 opacity-50">
            <div className="flex items-center gap-3">
              <CreditCard className="text-muted-foreground size-5" />
              <div className="flex-1">
                <p className="text-sm font-medium">
                  Configure payment terms and methods
                </p>
              </div>
              <Badge variant="secondary">Coming soon</Badge>
            </div>
          </div>
        </div>

        <Separator />

        {/* Section 4 — Order Summary */}
        <div className="rounded-lg border p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {itemCount}{' '}
              {itemCount === 1 ? <span>item</span> : <span>items</span>}
            </span>
            <span className="font-bold">${subtotal.toFixed(2)}</span>
          </div>
        </div>

        {/* Section 5 — Actions */}
        {!hasPlaceOrderPermission && (
          <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950">
            <ShieldAlert className="mt-0.5 size-5 shrink-0 text-amber-600 dark:text-amber-400" />
            <div>
              <p className="text-sm font-medium">Requires team approval</p>
              <p className="text-muted-foreground text-sm">
                You don&apos;t have permission to place orders. A team admin
                will need to review and submit this order.
              </p>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Button
            className="w-full"
            disabled={!hasPlaceOrderPermission || isSubmitting}
            onClick={() => onSubmit(deliveryNotes)}
          >
            {isSubmitting && <Loader2 className="animate-spin" />}
            Place Order
          </Button>
          <Button
            variant="ghost"
            className="w-full"
            onClick={onBack}
            disabled={isSubmitting}
          >
            Back to Cart
          </Button>
        </div>
      </div>
    </ScrollArea>
  )
}
