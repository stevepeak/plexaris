'use client'

import { ChevronRight, Trash2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export interface CartFolderProps {
  id: string
  name: string
  itemCount: number
  subtotal: number
  open: boolean
  onOpenChange: (open: boolean) => void
  onRename?: (id: string, name: string) => void
  onDelete?: (id: string) => void
  children: React.ReactNode
}

export function CartFolder({
  id,
  name,
  itemCount,
  subtotal,
  open,
  onOpenChange,
  onRename,
  onDelete,
  children,
}: CartFolderProps) {
  const [editing, setEditing] = useState(false)
  const [editValue, setEditValue] = useState(name)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [editing])

  function commitRename() {
    const trimmed = editValue.trim()
    if (trimmed && trimmed !== name) {
      onRename?.(id, trimmed)
    } else {
      setEditValue(name)
    }
    setEditing(false)
  }

  function cancelRename() {
    setEditValue(name)
    setEditing(false)
  }

  return (
    <Collapsible open={open} onOpenChange={onOpenChange}>
      <div className="flex items-center gap-2 px-4 py-2">
        <CollapsibleTrigger className="flex shrink-0 items-center">
          <ChevronRight
            className={cn('h-4 w-4 transition-transform', open && 'rotate-90')}
          />
        </CollapsibleTrigger>

        {editing ? (
          <Input
            ref={inputRef}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitRename()
              if (e.key === 'Escape') cancelRename()
            }}
            className="h-6 flex-1 px-1 text-xs"
          />
        ) : (
          <span
            className="flex-1 truncate text-left text-sm font-medium"
            onDoubleClick={() => {
              setEditValue(name)
              setEditing(true)
            }}
          >
            {name}
          </span>
        )}

        <Badge variant="secondary" className="shrink-0 text-xs">
          {itemCount}
        </Badge>
        <span className="shrink-0 text-xs text-muted-foreground">
          ${subtotal.toFixed(2)}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
          onClick={() => onDelete?.(id)}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
      <CollapsibleContent>{children}</CollapsibleContent>
    </Collapsible>
  )
}
