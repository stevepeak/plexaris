import { FieldNumber } from '../field-primitives'
import { ci, type FCProp } from '../types'

const NUTRITION_FIELDS = [
  { key: 'energyKj', label: 'Energy (kJ)' },
  { key: 'energyKcal', label: 'Energy (kcal)' },
  { key: 'fatG', label: 'Fat (g)' },
  { key: 'saturatedFatG', label: 'Saturated fat (g)' },
  { key: 'carbohydratesG', label: 'Carbohydrates (g)' },
  { key: 'sugarsG', label: 'Sugars (g)' },
  { key: 'proteinG', label: 'Protein (g)' },
  { key: 'saltG', label: 'Salt (g)' },
  { key: 'fiberG', label: 'Fiber (g)' },
] as const

export function NutritionFields({
  gn,
  u,
  fc,
  undo,
}: {
  gn: (p: string[]) => string
  u: (p: string[], v: unknown) => void
} & FCProp) {
  return (
    <>
      <p className="text-xs text-muted-foreground">Per 100g / 100ml</p>
      <div className="grid gap-4 sm:grid-cols-3">
        {NUTRITION_FIELDS.map(({ key, label }) => (
          <FieldNumber
            key={key}
            label={label}
            value={gn(['nutrition', key])}
            onChange={(v) => u(['nutrition', key], v)}
            change={ci(fc, undo, ['nutrition', key])}
          />
        ))}
      </div>
    </>
  )
}
