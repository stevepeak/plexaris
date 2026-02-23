import { Textarea } from '@/components/ui/textarea'

import { FieldInput, FieldLabel } from '../field-primitives'
import { ci, type FCProp } from '../types'

export function GeneralFields({
  g,
  u,
  fc,
  undo,
}: {
  g: (p: string[]) => string
  u: (p: string[], v: unknown) => void
} & FCProp) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <FieldInput
          label="Brand"
          value={g(['general', 'brand'])}
          onChange={(v) => u(['general', 'brand'], v)}
          change={ci(fc, undo, ['general', 'brand'])}
        />
        <FieldInput
          label="Variant"
          value={g(['general', 'variant'])}
          onChange={(v) => u(['general', 'variant'], v)}
          change={ci(fc, undo, ['general', 'variant'])}
        />
      </div>
      <div className="grid gap-2" id="field-general-description">
        <FieldLabel change={ci(fc, undo, ['general', 'description'])}>
          Description
        </FieldLabel>
        <Textarea
          value={g(['general', 'description'])}
          onChange={(e) => u(['general', 'description'], e.target.value)}
          rows={3}
          placeholder="Describe the product..."
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <FieldInput
          label="Article number"
          value={g(['general', 'articleNumber'])}
          onChange={(v) => u(['general', 'articleNumber'], v)}
          change={ci(fc, undo, ['general', 'articleNumber'])}
        />
        <FieldInput
          label="Intrastat code"
          value={g(['general', 'intrastatCode'])}
          onChange={(v) => u(['general', 'intrastatCode'], v)}
          placeholder="8 digits"
          change={ci(fc, undo, ['general', 'intrastatCode'])}
        />
        <FieldInput
          label="Country of origin"
          value={g(['general', 'countryOfOrigin'])}
          onChange={(v) => u(['general', 'countryOfOrigin'], v)}
          placeholder="e.g. NL"
          change={ci(fc, undo, ['general', 'countryOfOrigin'])}
        />
      </div>
    </>
  )
}
