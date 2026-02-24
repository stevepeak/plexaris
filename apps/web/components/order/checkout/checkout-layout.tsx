'use i18n'
'use client'

import { useEffect, useState } from 'react'

import { type CartItemData } from '../cart-item'
import { CheckoutForm } from './checkout-form'
import { CheckoutInvoice } from './checkout-invoice'
import { OrderTracking } from './order-tracking'

type CheckoutPhase =
  | 'form'
  | 'submitting'
  | 'slide-out'
  | 'stamp'
  | 'slide-in'
  | 'tracking'

interface CheckoutLayoutProps {
  orderNumber: number
  items: CartItemData[]
  subtotal: number
  itemCount: number
  orderStatus: string
  submittedAt: Date | null
  createdAt?: Date
  notes: string | null
  hasPlaceOrderPermission: boolean
  onSubmit: (deliveryNotes: string) => void
  isSubmitting: boolean
  isSuccess: boolean
  onBack: () => void
  onDuplicate?: () => void
  isDuplicating?: boolean
}

export function CheckoutLayout({
  orderNumber,
  items,
  subtotal,
  itemCount,
  orderStatus,
  submittedAt,
  createdAt,
  notes,
  hasPlaceOrderPermission,
  onSubmit,
  isSubmitting,
  isSuccess,
  onBack,
  onDuplicate,
  isDuplicating,
}: CheckoutLayoutProps) {
  const [phase, setPhase] = useState<CheckoutPhase>(() =>
    orderStatus !== 'draft' ? 'tracking' : 'form',
  )

  // When mutation succeeds, kick off the animation sequence
  useEffect(() => {
    if (isSuccess && phase === 'submitting') {
      setPhase('slide-out')
    }
  }, [isSuccess, phase])

  // Animation sequence: each phase triggers the next
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>
    if (phase === 'slide-out') {
      timeout = setTimeout(() => setPhase('stamp'), 300)
    } else if (phase === 'stamp') {
      timeout = setTimeout(() => setPhase('slide-in'), 800)
    } else if (phase === 'slide-in') {
      timeout = setTimeout(() => setPhase('tracking'), 500)
    }
    return () => clearTimeout(timeout)
  }, [phase])

  const handleSubmit = (deliveryNotes: string) => {
    setPhase('submitting')
    onSubmit(deliveryNotes)
  }

  const isPaid =
    phase === 'stamp' || phase === 'slide-in' || phase === 'tracking'

  const showForm =
    phase === 'form' || phase === 'submitting' || phase === 'slide-out'
  const showTracking = phase === 'slide-in' || phase === 'tracking'

  return (
    <div className="flex min-h-0 flex-1">
      {/* Left panel — Invoice */}
      <div className="relative flex-[3] border-r">
        <CheckoutInvoice
          orderNumber={orderNumber}
          items={items}
          subtotal={subtotal}
          isPaid={isPaid}
          createdAt={createdAt}
          submittedAt={submittedAt}
        />
      </div>

      {/* Right panel — Form or Tracking */}
      <div className="relative flex-[2] overflow-hidden">
        {showForm && (
          <div
            className={`h-full transition-all duration-300 ease-in ${
              phase === 'slide-out'
                ? 'translate-x-full opacity-0'
                : 'translate-x-0 opacity-100'
            }`}
          >
            <CheckoutForm
              hasPlaceOrderPermission={hasPlaceOrderPermission}
              isSubmitting={phase === 'submitting' || isSubmitting}
              onSubmit={handleSubmit}
              onBack={onBack}
              subtotal={subtotal}
              itemCount={itemCount}
            />
          </div>
        )}
        {showTracking && (
          <div
            className={`h-full transition-all duration-500 ease-out ${
              phase === 'slide-in'
                ? 'translate-x-full opacity-0'
                : 'translate-x-0 opacity-100'
            }`}
          >
            <OrderTracking
              orderNumber={orderNumber}
              status={
                (orderStatus === 'draft' ? 'submitted' : orderStatus) as
                  | 'submitted'
                  | 'confirmed'
                  | 'delivered'
                  | 'cancelled'
              }
              submittedAt={submittedAt ?? new Date()}
              deliveryNotes={notes}
              onDuplicate={onDuplicate}
              isDuplicating={isDuplicating}
            />
          </div>
        )}
      </div>
    </div>
  )
}
