import { Undo2 } from 'lucide-react'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

import { type ChangeInfo } from './types'

export function formatChangeValue(value: unknown): string {
  if (value === null || value === undefined || value === '') return '(empty)'
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  return String(value)
}

export function FieldLabel({
  children,
  htmlFor,
  change,
}: {
  children: React.ReactNode
  htmlFor?: string
  change?: { originalValue: unknown; onUndo: () => void }
}) {
  return (
    <div className="flex items-center gap-1.5">
      <Label htmlFor={htmlFor}>{children}</Label>
      {change && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={change.onUndo}
                className="rounded p-0.5 hover:bg-muted"
              >
                <Undo2 className="h-3 w-3 text-amber-500" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              Was: {formatChangeValue(change.originalValue)}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  )
}

export function FieldInput({
  label,
  value,
  onChange,
  placeholder,
  change,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  change?: ChangeInfo
}) {
  return (
    <div className="grid gap-2" id={change?.fieldId}>
      <FieldLabel change={change}>{label}</FieldLabel>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  )
}

export function FieldNumber({
  label,
  value,
  onChange,
  change,
}: {
  label: string
  value: string
  onChange: (v: number | undefined) => void
  change?: ChangeInfo
}) {
  return (
    <div className="grid gap-2" id={change?.fieldId}>
      <FieldLabel change={change}>{label}</FieldLabel>
      <Input
        type="number"
        step="any"
        value={value}
        onChange={(e) => {
          const v = e.target.value
          onChange(v === '' ? undefined : Number(v))
        }}
      />
    </div>
  )
}
