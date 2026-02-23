import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { FieldInput, FieldLabel, FieldNumber } from '../field-primitives'
import { ci, type FCProp } from '../types'

export function PackagingFields({
  section,
  g,
  gn,
  u,
  weightUnit,
  dimUnit,
  showUnitsPerCase,
  fc,
  undo,
}: {
  section: 'unit' | 'case'
  g: (p: string[]) => string
  gn: (p: string[]) => string
  u: (p: string[], v: unknown) => void
  weightUnit: string
  dimUnit: string
  showUnitsPerCase: boolean
} & FCProp) {
  const packagingOptions =
    section === 'unit'
      ? ['bottle_glass', 'pet_bottle', 'bag', 'bucket']
      : ['tray', 'box', 'bucket']

  return (
    <>
      <FieldInput
        label="GTIN / EAN"
        value={g([section, 'gtin'])}
        onChange={(v) => u([section, 'gtin'], v)}
        placeholder="8, 12, 13, or 14 digits"
        change={ci(fc, undo, [section, 'gtin'])}
      />
      <p className="text-xs font-medium text-muted-foreground">
        Dimensions ({dimUnit})
      </p>
      <div className="grid gap-4 sm:grid-cols-3">
        <FieldNumber
          label="Height"
          value={gn([section, 'dimensions', 'height'])}
          onChange={(v) => u([section, 'dimensions', 'height'], v)}
          change={ci(fc, undo, [section, 'dimensions', 'height'])}
        />
        <FieldNumber
          label="Width"
          value={gn([section, 'dimensions', 'width'])}
          onChange={(v) => u([section, 'dimensions', 'width'], v)}
          change={ci(fc, undo, [section, 'dimensions', 'width'])}
        />
        <FieldNumber
          label="Depth"
          value={gn([section, 'dimensions', 'depth'])}
          onChange={(v) => u([section, 'dimensions', 'depth'], v)}
          change={ci(fc, undo, [section, 'dimensions', 'depth'])}
        />
      </div>
      <p className="text-xs font-medium text-muted-foreground">
        Weight ({weightUnit})
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <FieldNumber
          label="Gross"
          value={gn([section, 'weight', 'gross'])}
          onChange={(v) => u([section, 'weight', 'gross'], v)}
          change={ci(fc, undo, [section, 'weight', 'gross'])}
        />
        <FieldNumber
          label="Net"
          value={gn([section, 'weight', 'net'])}
          onChange={(v) => u([section, 'weight', 'net'], v)}
          change={ci(fc, undo, [section, 'weight', 'net'])}
        />
      </div>
      <p className="text-xs font-medium text-muted-foreground">Net content</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <FieldNumber
          label="Milliliters"
          value={gn([section, 'netContent', 'milliliters'])}
          onChange={(v) => u([section, 'netContent', 'milliliters'], v)}
          change={ci(fc, undo, [section, 'netContent', 'milliliters'])}
        />
        <FieldNumber
          label="Grams"
          value={gn([section, 'netContent', 'grams'])}
          onChange={(v) => u([section, 'netContent', 'grams'], v)}
          change={ci(fc, undo, [section, 'netContent', 'grams'])}
        />
      </div>
      {showUnitsPerCase && (
        <FieldNumber
          label="Units per case"
          value={gn([section, 'unitsPerCase'])}
          onChange={(v) => u([section, 'unitsPerCase'], v)}
          change={ci(fc, undo, [section, 'unitsPerCase'])}
        />
      )}
      <div className="grid gap-2" id={`field-${section}-packagingType`}>
        <FieldLabel change={ci(fc, undo, [section, 'packagingType'])}>
          Packaging type
        </FieldLabel>
        <Select
          value={g([section, 'packagingType'])}
          onValueChange={(v) => u([section, 'packagingType'], v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            {packagingOptions.map((t) => (
              <SelectItem key={t} value={t}>
                {t.replace(/_/g, ' ')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  )
}
