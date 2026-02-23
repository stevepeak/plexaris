import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { FieldLabel, FieldNumber } from '../field-primitives'
import { ci, type FCProp } from '../types'

export function StorageFields({
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
      <p className="text-xs font-medium text-muted-foreground">
        Temperature range (°C)
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <FieldNumber
          label="Min"
          value={gn(['storage', 'temperatureRange', 'min'])}
          onChange={(v) => u(['storage', 'temperatureRange', 'min'], v)}
          change={ci(fc, undo, ['storage', 'temperatureRange', 'min'])}
        />
        <FieldNumber
          label="Max"
          value={gn(['storage', 'temperatureRange', 'max'])}
          onChange={(v) => u(['storage', 'temperatureRange', 'max'], v)}
          change={ci(fc, undo, ['storage', 'temperatureRange', 'max'])}
        />
      </div>
      <div className="grid gap-2" id="field-storage-storageType">
        <FieldLabel change={ci(fc, undo, ['storage', 'storageType'])}>
          Storage type
        </FieldLabel>
        <Select
          value={g(['storage', 'storageType'])}
          onValueChange={(v) => u(['storage', 'storageType'], v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ambient">Ambient</SelectItem>
            <SelectItem value="chilled">Chilled</SelectItem>
            <SelectItem value="frozen">Frozen</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <FieldNumber
          label="Shelf life from production (days)"
          value={gn(['storage', 'shelfLifeFromProductionDays'])}
          onChange={(v) => u(['storage', 'shelfLifeFromProductionDays'], v)}
          change={ci(fc, undo, ['storage', 'shelfLifeFromProductionDays'])}
        />
        <FieldNumber
          label="Shelf life from delivery (days)"
          value={gn(['storage', 'shelfLifeFromDeliveryDays'])}
          onChange={(v) => u(['storage', 'shelfLifeFromDeliveryDays'], v)}
          change={ci(fc, undo, ['storage', 'shelfLifeFromDeliveryDays'])}
        />
      </div>
    </>
  )
}
