import { Textarea } from '@/components/ui/textarea'

import { FieldInput, FieldLabel, FieldNumber } from '../field-primitives'
import { ci, type FCProp } from '../types'

export function IngredientsFields({
  g,
  gn,
  u,
  fc,
  undo,
}: {
  g: (p: string[]) => string
  gn: (p: string[]) => string
  u: (p: string[], v: unknown) => void
} & FCProp) {
  return (
    <>
      <div className="grid gap-2" id="field-ingredients-ingredients">
        <FieldLabel change={ci(fc, undo, ['ingredients', 'ingredients'])}>
          Ingredients list
        </FieldLabel>
        <Textarea
          value={g(['ingredients', 'ingredients'])}
          onChange={(e) => u(['ingredients', 'ingredients'], e.target.value)}
          rows={4}
          placeholder="Full ingredient list as shown on label"
        />
      </div>
      <div className="grid gap-2" id="field-ingredients-warningStatements">
        <FieldLabel change={ci(fc, undo, ['ingredients', 'warningStatements'])}>
          Warning statements
        </FieldLabel>
        <Textarea
          value={g(['ingredients', 'warningStatements'])}
          onChange={(e) =>
            u(['ingredients', 'warningStatements'], e.target.value)
          }
          rows={2}
          placeholder="Warning statements on label"
        />
      </div>
      <p className="text-xs font-medium text-muted-foreground">Palm oil</p>
      <div className="grid gap-4 sm:grid-cols-3">
        <FieldInput
          label="Origin"
          value={g(['ingredients', 'palmOil', 'origin'])}
          onChange={(v) => u(['ingredients', 'palmOil', 'origin'], v)}
          change={ci(fc, undo, ['ingredients', 'palmOil', 'origin'])}
        />
        <FieldNumber
          label="Amount (%)"
          value={gn(['ingredients', 'palmOil', 'amountPercent'])}
          onChange={(v) => u(['ingredients', 'palmOil', 'amountPercent'], v)}
          change={ci(fc, undo, ['ingredients', 'palmOil', 'amountPercent'])}
        />
        <FieldInput
          label="RSPO certificate"
          value={g(['ingredients', 'palmOil', 'rspoCertificate'])}
          onChange={(v) => u(['ingredients', 'palmOil', 'rspoCertificate'], v)}
          change={ci(fc, undo, ['ingredients', 'palmOil', 'rspoCertificate'])}
        />
      </div>
    </>
  )
}
