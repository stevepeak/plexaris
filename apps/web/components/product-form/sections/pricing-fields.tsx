import { FieldNumber } from '../field-primitives'
import { ci, type FCProp } from '../types'

export function PricingFields({
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
      <div className="grid gap-4 sm:grid-cols-2">
        <FieldNumber
          label="Ex Works / kg"
          value={gn(['pricing', 'exWorksPerKg'])}
          onChange={(v) => u(['pricing', 'exWorksPerKg'], v)}
          change={ci(fc, undo, ['pricing', 'exWorksPerKg'])}
        />
        <FieldNumber
          label="Ex Works / unit"
          value={gn(['pricing', 'exWorksPerUnit'])}
          onChange={(v) => u(['pricing', 'exWorksPerUnit'], v)}
          change={ci(fc, undo, ['pricing', 'exWorksPerUnit'])}
        />
        <FieldNumber
          label="Delivered / kg"
          value={gn(['pricing', 'deliveredPerKg'])}
          onChange={(v) => u(['pricing', 'deliveredPerKg'], v)}
          change={ci(fc, undo, ['pricing', 'deliveredPerKg'])}
        />
        <FieldNumber
          label="Delivered / unit"
          value={gn(['pricing', 'deliveredPerUnit'])}
          onChange={(v) => u(['pricing', 'deliveredPerUnit'], v)}
          change={ci(fc, undo, ['pricing', 'deliveredPerUnit'])}
        />
      </div>
    </>
  )
}
