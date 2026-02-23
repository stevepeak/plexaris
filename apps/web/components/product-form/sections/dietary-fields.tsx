import { Leaf, Moon, Sprout, Star, Undo2 } from 'lucide-react'

import { Switch } from '@/components/ui/switch'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

import { formatChangeValue } from '../field-primitives'
import { ci, type FCProp } from '../types'

const DIETARY_CONFIG = [
  {
    key: 'kosher',
    label: 'Kosher',
    icon: Star,
    activeClasses: 'border-blue-400',
    iconColor: 'text-blue-600',
  },
  {
    key: 'halal',
    label: 'Halal',
    icon: Moon,
    activeClasses: 'border-green-400',
    iconColor: 'text-green-600',
  },
  {
    key: 'vegetarian',
    label: 'Vegetarian',
    icon: Leaf,
    activeClasses: 'border-emerald-400',
    iconColor: 'text-emerald-600',
  },
  {
    key: 'vegan',
    label: 'Vegan',
    icon: Sprout,
    activeClasses: 'border-teal-400',
    iconColor: 'text-teal-600',
  },
] as const

export function DietaryFields({
  data,
  u,
  fc,
  undo,
}: {
  data: Record<string, unknown>
  u: (p: string[], v: unknown) => void
} & FCProp) {
  const dietary = (data.dietary as Record<string, boolean>) ?? {}

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {DIETARY_CONFIG.map((item) => {
        const isActive = dietary[item.key] ?? false
        const change = ci(fc, undo, ['dietary', item.key])
        return (
          <div
            key={item.key}
            id={`field-dietary-${item.key}`}
            className={cn(
              'relative flex flex-col items-center gap-2 rounded-lg border p-3 transition-all',
              isActive ? item.activeClasses : 'opacity-40',
            )}
          >
            {change && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={change.onUndo}
                      className="absolute top-1.5 right-1.5 rounded p-0.5 hover:bg-muted"
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
            <item.icon
              className={cn(
                'h-6 w-6',
                isActive ? item.iconColor : 'text-muted-foreground',
              )}
            />
            <span className="text-xs font-medium">{item.label}</span>
            <Switch
              checked={isActive}
              onCheckedChange={(checked) => u(['dietary', item.key], !!checked)}
            />
          </div>
        )
      })}
    </div>
  )
}
