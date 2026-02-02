'use client'

import { cn } from '@/lib/utils'

type StepDefinition = {
  id: string
  label: string
}

export function StepProgress({
  steps,
  currentStepIndex,
}: {
  steps: StepDefinition[]
  currentStepIndex: number
}) {
  return (
    <div className="flex items-center gap-2">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center gap-2">
          <div
            className={cn(
              'flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium',
              index <= currentStepIndex
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground',
            )}
          >
            {index + 1}
          </div>
          <span
            className={cn(
              'text-sm',
              index <= currentStepIndex
                ? 'font-medium'
                : 'text-muted-foreground',
            )}
          >
            {step.label}
          </span>
          {index < steps.length - 1 && <div className="h-px w-8 bg-border" />}
        </div>
      ))}
    </div>
  )
}
