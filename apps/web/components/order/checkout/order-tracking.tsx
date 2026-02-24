'use i18n'
import { CheckCircle2, Copy, PackageCheck, Truck, XCircle } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

interface OrderTrackingProps {
  orderNumber: number
  status: 'submitted' | 'confirmed' | 'delivered' | 'cancelled'
  submittedAt: Date | null
  deliveryNotes?: string | null
  onDuplicate?: () => void
  isDuplicating?: boolean
}

const STEPS = [
  { key: 'submitted', label: 'Submitted', icon: CheckCircle2 },
  { key: 'confirmed', label: 'Confirmed', icon: PackageCheck },
  { key: 'delivered', label: 'Delivered', icon: Truck },
] as const

const STATUS_ORDER = ['submitted', 'confirmed', 'delivered'] as const

function formatTimestamp(date: Date) {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function getStepState(
  stepKey: string,
  currentStatus: string,
): 'completed' | 'current' | 'future' {
  const stepIdx = STATUS_ORDER.indexOf(stepKey as (typeof STATUS_ORDER)[number])
  const currentIdx = STATUS_ORDER.indexOf(
    currentStatus as (typeof STATUS_ORDER)[number],
  )
  if (currentIdx < 0) return 'future'
  if (stepIdx < currentIdx) return 'completed'
  if (stepIdx === currentIdx) return 'current'
  return 'future'
}

export function OrderTracking({
  orderNumber,
  status,
  submittedAt,
  deliveryNotes,
  onDuplicate,
  isDuplicating,
}: OrderTrackingProps) {
  const isCancelled = status === 'cancelled'

  return (
    <ScrollArea className="h-full">
      <div className="space-y-6 p-6">
        {/* Section 1 — Status Timeline */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Order Status</label>

          {isCancelled ? (
            <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950">
              <XCircle className="size-5 shrink-0 text-red-500" />
              <div>
                <p className="text-sm font-medium text-red-700 dark:text-red-300">
                  Order Cancelled
                </p>
                <p className="text-muted-foreground text-sm">
                  This order has been cancelled and will not be processed.
                </p>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border p-4">
              <div className="space-y-0">
                {STEPS.map((step, idx) => {
                  const state = getStepState(step.key, status)
                  const Icon = step.icon
                  const isLast = idx === STEPS.length - 1

                  return (
                    <div key={step.key} className="flex gap-3">
                      {/* Dot + line column */}
                      <div className="flex flex-col items-center">
                        <div
                          className={cn(
                            'flex size-8 shrink-0 items-center justify-center rounded-full',
                            state === 'completed' &&
                              'bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-400',
                            state === 'current' &&
                              'bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-400',
                            state === 'future' &&
                              'bg-muted text-muted-foreground',
                          )}
                        >
                          {state === 'current' && (
                            <span className="absolute size-8 animate-ping rounded-full bg-green-400 opacity-20" />
                          )}
                          <Icon className="relative size-4" />
                        </div>
                        {!isLast && (
                          <div
                            className={cn(
                              'my-1 h-6 w-0.5',
                              state === 'completed' || state === 'current'
                                ? 'bg-green-300 dark:bg-green-700'
                                : 'border-l-2 border-dashed border-muted-foreground/30',
                            )}
                          />
                        )}
                      </div>

                      {/* Label + timestamp column */}
                      <div className="pt-1">
                        <p
                          className={cn(
                            'text-sm',
                            state === 'current' && 'font-bold',
                            state === 'completed' && 'font-medium',
                            state === 'future' && 'text-muted-foreground',
                          )}
                        >
                          {step.label}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {step.key === 'submitted' && submittedAt
                            ? formatTimestamp(submittedAt)
                            : state === 'completed'
                              ? 'Completed'
                              : state === 'current'
                                ? 'In progress'
                                : 'Pending'}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Section 2 — Delivery Notes */}
        {deliveryNotes && (
          <>
            <Separator />
            <div className="space-y-2">
              <label className="text-sm font-medium">Delivery Notes</label>
              <div className="text-muted-foreground rounded-lg border p-4 text-sm">
                {deliveryNotes}
              </div>
            </div>
          </>
        )}

        <Separator />

        {/* Section 3 — Delivery Updates */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Delivery Updates</label>
          <div className="relative rounded-lg border p-4 opacity-50">
            <div className="flex items-center gap-3">
              <Truck className="text-muted-foreground size-5" />
              <div className="flex-1">
                <p className="text-sm font-medium">
                  Track real-time delivery status and updates from your
                  suppliers
                </p>
              </div>
              <Badge variant="secondary">Coming soon</Badge>
            </div>
          </div>
        </div>

        <Separator />

        {/* Section 4 — Actions */}
        <div className="flex gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="flex-1">
                  <Button variant="ghost" className="w-full" disabled>
                    Request Modification
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent>Coming soon</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Button
            variant="ghost"
            className="flex-1"
            onClick={onDuplicate}
            disabled={isDuplicating}
          >
            <Copy className="size-4" />
            Duplicate as New Order
          </Button>
        </div>

        {/* Order ID reference */}
        <p className="text-muted-foreground text-center font-mono text-xs">
          Order #{orderNumber}
        </p>
      </div>
    </ScrollArea>
  )
}
