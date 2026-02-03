'use client'

import { MessageSquare, Search, ShoppingCart } from 'lucide-react'

import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

export interface PanelState {
  search: boolean
  order: boolean
  chat: boolean
}

interface PanelToggleBarProps {
  panels: PanelState
  onToggle: (panel: keyof PanelState) => void
}

const TOGGLES: { key: keyof PanelState; icon: typeof Search; label: string }[] =
  [
    { key: 'search', icon: Search, label: 'Search' },
    { key: 'order', icon: ShoppingCart, label: 'Your Order' },
    { key: 'chat', icon: MessageSquare, label: 'Chat' },
  ]

export function PanelToggleBar({ panels, onToggle }: PanelToggleBarProps) {
  const value = TOGGLES.filter((t) => panels[t.key]).map((t) => t.key)

  return (
    <TooltipProvider delayDuration={300}>
      <ToggleGroup
        type="multiple"
        size="sm"
        value={value}
        onValueChange={(next) => {
          for (const toggle of TOGGLES) {
            const wasOn = panels[toggle.key]
            const isOn = next.includes(toggle.key)
            if (wasOn !== isOn) {
              onToggle(toggle.key)
            }
          }
        }}
      >
        {TOGGLES.map((toggle) => (
          <Tooltip key={toggle.key}>
            <TooltipTrigger asChild>
              <ToggleGroupItem
                value={toggle.key}
                aria-label={`Toggle ${toggle.label}`}
                className={cn(
                  panels[toggle.key] && 'bg-accent text-accent-foreground',
                )}
              >
                <toggle.icon className="h-4 w-4" />
              </ToggleGroupItem>
            </TooltipTrigger>
            <TooltipContent side="bottom">{toggle.label}</TooltipContent>
          </Tooltip>
        ))}
      </ToggleGroup>
    </TooltipProvider>
  )
}
