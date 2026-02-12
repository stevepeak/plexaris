'use client'

import { Undo2 } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { type FieldChange } from '@/hooks/use-product-changes'

function formatValue(value: unknown): string {
  if (value === null || value === undefined || value === '') return '(empty)'
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

export function ProductChangesPopover({
  changes,
  onUndo,
  onNavigate,
}: {
  changes: FieldChange[]
  onUndo: (change: FieldChange) => void
  onNavigate: (change: FieldChange) => void
}) {
  const [open, setOpen] = useState(false)

  if (changes.length === 0) return null

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          ({changes.length}) {changes.length === 1 ? 'Change' : 'Changes'}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="border-b px-3 py-2">
          <p className="text-sm font-medium">
            {changes.length} unsaved{' '}
            {changes.length === 1 ? 'change' : 'changes'}
          </p>
        </div>
        <ScrollArea className="max-h-80">
          <div className="grid gap-0.5 p-1">
            {changes.map((change) => (
              <div
                key={change.key}
                className="flex cursor-pointer items-start gap-2 rounded-md px-2 py-1.5 hover:bg-muted/50"
                onClick={() => {
                  setOpen(false)
                  onNavigate(change)
                }}
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium leading-tight">
                    {change.label}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {formatValue(change.originalValue)} &rarr;{' '}
                    {formatValue(change.currentValue)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onUndo(change)
                  }}
                  className="mt-0.5 shrink-0 rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <Undo2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
