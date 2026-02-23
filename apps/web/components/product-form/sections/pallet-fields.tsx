import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { FieldInput, FieldLabel, FieldNumber } from '../field-primitives'
import { ci, type FCProp } from '../types'

const PALLET_TYPES = [
  { value: 'euro', label: 'Euro Pallet (EPAL/EUR)', size: '120 x 80 cm' },
  { value: 'chep', label: 'CHEP Pallet', size: '120 x 100 cm' },
  {
    value: 'block',
    label: 'Block Pallet / Industrial',
    size: '120 x 100 cm',
  },
] as const

export function PalletFields({
  gn,
  g,
  u,
  fc,
  undo,
}: {
  gn: (p: string[]) => string
  g: (p: string[]) => string
  u: (p: string[], v: unknown) => void
} & FCProp) {
  const currentType = g(['pallet', 'palletType'])

  return (
    <>
      <FieldInput
        label="GTIN / EAN"
        value={g(['pallet', 'gtin'])}
        onChange={(v) => u(['pallet', 'gtin'], v)}
        change={ci(fc, undo, ['pallet', 'gtin'])}
      />
      <div className="grid gap-2" id="field-pallet-palletType">
        <FieldLabel change={ci(fc, undo, ['pallet', 'palletType'])}>
          Pallet type
        </FieldLabel>
        <Select
          value={currentType}
          onValueChange={(v) => u(['pallet', 'palletType'], v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select pallet type" />
          </SelectTrigger>
          <SelectContent>
            {PALLET_TYPES.map((pt) => (
              <SelectItem key={pt.value} value={pt.value}>
                {pt.label} ({pt.size})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <p className="text-xs font-medium text-muted-foreground">
        Load configuration
      </p>
      <div className="grid gap-4 sm:grid-cols-3">
        <FieldNumber
          label="Layers / pallet"
          value={gn(['pallet', 'load', 'layersPerPallet'])}
          onChange={(v) => u(['pallet', 'load', 'layersPerPallet'], v)}
          change={ci(fc, undo, ['pallet', 'load', 'layersPerPallet'])}
        />
        <FieldNumber
          label="Cases / layer"
          value={gn(['pallet', 'load', 'casesPerLayer'])}
          onChange={(v) => u(['pallet', 'load', 'casesPerLayer'], v)}
          change={ci(fc, undo, ['pallet', 'load', 'casesPerLayer'])}
        />
        <FieldNumber
          label="Cases / pallet"
          value={gn(['pallet', 'load', 'casesPerPallet'])}
          onChange={(v) => u(['pallet', 'load', 'casesPerPallet'], v)}
          change={ci(fc, undo, ['pallet', 'load', 'casesPerPallet'])}
        />
      </div>
      <p className="text-xs font-medium text-muted-foreground">
        Dimensions (cm)
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <FieldNumber
          label="Height (with product)"
          value={gn(['pallet', 'dimensions', 'heightWithProduct'])}
          onChange={(v) => u(['pallet', 'dimensions', 'heightWithProduct'], v)}
          change={ci(fc, undo, ['pallet', 'dimensions', 'heightWithProduct'])}
        />
        <FieldNumber
          label="Height (without product)"
          value={gn(['pallet', 'dimensions', 'heightWithoutProduct'])}
          onChange={(v) =>
            u(['pallet', 'dimensions', 'heightWithoutProduct'], v)
          }
          change={ci(fc, undo, [
            'pallet',
            'dimensions',
            'heightWithoutProduct',
          ])}
        />
        <FieldNumber
          label="Width"
          value={gn(['pallet', 'dimensions', 'width'])}
          onChange={(v) => u(['pallet', 'dimensions', 'width'], v)}
          change={ci(fc, undo, ['pallet', 'dimensions', 'width'])}
        />
        <FieldNumber
          label="Depth"
          value={gn(['pallet', 'dimensions', 'depth'])}
          onChange={(v) => u(['pallet', 'dimensions', 'depth'], v)}
          change={ci(fc, undo, ['pallet', 'dimensions', 'depth'])}
        />
      </div>
      <p className="text-xs font-medium text-muted-foreground">Weight (kg)</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <FieldNumber
          label="Gross"
          value={gn(['pallet', 'weight', 'gross'])}
          onChange={(v) => u(['pallet', 'weight', 'gross'], v)}
          change={ci(fc, undo, ['pallet', 'weight', 'gross'])}
        />
        <FieldNumber
          label="Net"
          value={gn(['pallet', 'weight', 'net'])}
          onChange={(v) => u(['pallet', 'weight', 'net'], v)}
          change={ci(fc, undo, ['pallet', 'weight', 'net'])}
        />
      </div>
    </>
  )
}
