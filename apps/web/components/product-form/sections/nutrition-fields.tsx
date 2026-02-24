'use i18n'
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

function NutritionLabel({ text }: { text: string }) {
  switch (text) {
    case 'Energy (kJ)':
      return <span>Energy (kJ)</span>
    case 'Energy (kcal)':
      return <span>Energy (kcal)</span>
    case 'Fat (g)':
      return <span>Fat (g)</span>
    case 'Saturated fat (g)':
      return <span>Saturated fat (g)</span>
    case 'Carbohydrates (g)':
      return <span>Carbohydrates (g)</span>
    case 'Sugars (g)':
      return <span>Sugars (g)</span>
    case 'Protein (g)':
      return <span>Protein (g)</span>
    case 'Salt (g)':
      return <span>Salt (g)</span>
    case 'Fiber (g)':
      return <span>Fiber (g)</span>
    default:
      return <span>{text}</span>
  }
}

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
            label={<NutritionLabel text={label} />}
            value={gn(['nutrition', key])}
            onChange={(v) => u(['nutrition', key], v)}
            change={ci(fc, undo, ['nutrition', key])}
          />
        ))}
      </div>
    </>
  )
}
