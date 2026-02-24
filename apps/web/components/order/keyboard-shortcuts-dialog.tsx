'use i18n'
'use client'

import { Keyboard } from 'lucide-react'

import { Kbd } from '@/components/kbd'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface KeyboardShortcutsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function ShortcutText({ text }: { text: string }) {
  switch (text) {
    case 'Panels':
      return <span>Panels</span>
    case 'Tabs':
      return <span>Tabs</span>
    case 'Cart items':
      return <span>Cart items</span>
    case 'General':
      return <span>General</span>
    case 'Toggle search':
      return <span>Toggle search</span>
    case 'Toggle cart':
      return <span>Toggle cart</span>
    case 'Toggle chat':
      return <span>Toggle chat</span>
    case 'Switch to tab 1':
      return <span>Switch to tab 1</span>
    case 'Switch to tab 2–9':
      return <span>Switch to tab 2–9</span>
    case 'Close current tab':
      return <span>Close current tab</span>
    case 'View activity':
      return <span>View activity</span>
    case 'Edit cart':
      return <span>Edit cart</span>
    case 'Advanced options':
      return <span>Advanced options</span>
    case 'Previous item':
      return <span>Previous item</span>
    case 'Next item':
      return <span>Next item</span>
    case 'Increment quantity':
      return <span>Increment quantity</span>
    case 'Decrement quantity':
      return <span>Decrement quantity</span>
    case 'Remove item':
      return <span>Remove item</span>
    case 'Keyboard shortcuts':
      return <span>Keyboard shortcuts</span>
    case 'Clear search & blur':
      return <span>Clear search & blur</span>
    default:
      return <span>{text}</span>
  }
}

const SHORTCUT_GROUPS = [
  {
    label: 'Panels',
    shortcuts: [
      { keys: ['S'], description: 'Toggle search' },
      { keys: ['K'], description: 'Toggle cart' },
      { keys: ['C'], description: 'Toggle chat' },
    ],
  },
  {
    label: 'Tabs',
    shortcuts: [
      { keys: ['1'], description: 'Switch to tab 1' },
      { keys: ['2–9'], description: 'Switch to tab 2–9' },
      { keys: ['W'], description: 'Close current tab' },
      { keys: ['A'], description: 'View activity' },
      { keys: ['E'], description: 'Edit cart' },
      { keys: ['X'], description: 'Advanced options' },
    ],
  },
  {
    label: 'Cart items',
    shortcuts: [
      { keys: ['↑'], description: 'Previous item' },
      { keys: ['↓'], description: 'Next item' },
      { keys: ['+'], description: 'Increment quantity' },
      { keys: ['−'], description: 'Decrement quantity' },
      { keys: ['Del'], description: 'Remove item' },
    ],
  },
  {
    label: 'General',
    shortcuts: [
      { keys: ['/'], description: 'Keyboard shortcuts' },
      { keys: ['Esc'], description: 'Clear search & blur' },
    ],
  },
]

export function KeyboardShortcutsDialog({
  open,
  onOpenChange,
}: KeyboardShortcutsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Keyboard className="h-4 w-4" />
              </Button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            Keyboard shortcuts <Kbd className="ml-1">/</Kbd>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Keyboard shortcuts</DialogTitle>
          <DialogDescription>
            Shortcuts are disabled while typing in an input.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {SHORTCUT_GROUPS.map((group) => (
            <div key={group.label}>
              <h4 className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <ShortcutText text={group.label} />
              </h4>
              <div className="space-y-1">
                {group.shortcuts.map((shortcut) => (
                  <div
                    key={shortcut.description}
                    className="flex items-center justify-between py-1"
                  >
                    <span className="text-sm">
                      <ShortcutText text={shortcut.description} />
                    </span>
                    <div className="flex gap-1">
                      {shortcut.keys.map((key) => (
                        <Kbd
                          key={key}
                          className="inline-flex h-6 min-w-6 items-center justify-center bg-muted px-1.5 text-xs"
                        >
                          {key}
                        </Kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
