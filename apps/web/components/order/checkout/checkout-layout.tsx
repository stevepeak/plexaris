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
  orderId: string
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
  orderId,
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

  // Animation sequence: slide-out → stamp → slide-in → tracking
  useEffect(() => {
    if (phase !== 'slide-out') return
    const t1 = setTimeout(() => setPhase('stamp'), 300)
    const t2 = setTimeout(() => setPhase('slide-in'), 1100)
    const t3 = setTimeout(() => setPhase('tracking'), 1600)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
    }
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
          orderId={orderId}
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
              orderId={orderId}
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
