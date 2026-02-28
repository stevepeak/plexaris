'use i18n'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { FieldLabel } from '../field-primitives'
import { ci, type FCProp } from '../types'

const EU_ALLERGENS = [
  'milk',
  'fish',
  'crustaceans',
  'gluten',
  'eggs',
  'peanuts',
  'nuts',
  'sesame',
  'soy',
  'celery',
  'mustard',
  'sulfites',
  'lupin',
  'molluscs',
] as const

const ALLERGEN_STATUSES = ['contains', 'may_contain', 'absent'] as const

export function AllergensFields({
  data,
  u,
  fc,
  undo,
}: {
  data: Record<string, unknown>
  u: (p: string[], v: unknown) => void
} & FCProp) {
  const allergenData = (data.allergens as Record<string, unknown>) ?? {}
  const allergenMap = (allergenData.allergens as Record<string, string>) ?? {}

  return (
    <div className="grid gap-4">
      <p className="text-xs text-muted-foreground">EU-14 allergens</p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {EU_ALLERGENS.map((allergen) => (
          <div
            key={allergen}
            id={`field-allergens-allergens-${allergen}`}
            className="flex items-center gap-3"
          >
            <FieldLabel
              change={ci(fc, undo, ['allergens', 'allergens', allergen])}
            >
              <span className="w-24 text-sm capitalize">{allergen}</span>
            </FieldLabel>
            <Select
              value={allergenMap[allergen] ?? ''}
              onValueChange={(v) => {
                const updated = { ...allergenMap, [allergen]: v }
                u(['allergens', 'allergens'], updated)
              }}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Not set" />
              </SelectTrigger>
              <SelectContent>
                {ALLERGEN_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s.replace(/_/g, ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}
      </div>
    </div>
  )
}
