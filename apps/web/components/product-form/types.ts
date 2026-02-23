import type React from 'react'

import { type Product, type ProductSectionKey } from '@app/db/data-schemas'
import {
  Box,
  Camera,
  CircleDollarSign,
  Info,
  Leaf,
  Package,
  ShieldAlert,
  Tag,
  Thermometer,
  UtensilsCrossed,
  Warehouse,
  WheatOff,
} from 'lucide-react'

import { type FieldChange } from '@/hooks/use-product-changes'

export const SECTION_ICONS: Record<
  ProductSectionKey,
  React.ComponentType<{ className?: string }>
> = {
  general: Info,
  photos: Camera,
  unit: Package,
  case: Box,
  pallet: Warehouse,
  ingredients: UtensilsCrossed,
  nutrition: WheatOff,
  allergens: ShieldAlert,
  dietary: Leaf,
  storage: Thermometer,
  pricing: CircleDollarSign,
  label: Tag,
}

export type ProductFormData = {
  name: string
  category: string
  note?: string
  data?: Partial<Product>
}

export type ProductFormProps = {
  productId?: string
  product?: {
    id: string
    name: string
    description: string | null
    price: string | null
    unit: string | null
    category: string | null
    status: string
    data?: Partial<Product> | null
  } | null
  onSubmit?: (data: ProductFormData) => Promise<{ error?: string }>
  onCancel?: () => void
  onViewHistory?: () => void
  isPending?: boolean
}

export type SectionFieldsProps = {
  sectionKey: ProductSectionKey
  getFieldString: (path: string[]) => string
  getFieldNumber: (path: string[]) => string
  updateField: (path: string[], value: unknown) => void
  data: Record<string, unknown>
  fc: (path: string[]) => FieldChange | undefined
  onUndo: (change: FieldChange) => void
}

export type ChangeInfo = {
  originalValue: unknown
  onUndo: () => void
  fieldId: string
}

export type FCProp = {
  fc: (path: string[]) => FieldChange | undefined
  undo: (change: FieldChange) => void
}

/** Build a ChangeInfo from a FieldChange, or undefined */
export function ci(
  fc: (path: string[]) => FieldChange | undefined,
  onUndo: (change: FieldChange) => void,
  path: string[],
): ChangeInfo | undefined {
  const change = fc(path)
  if (!change) return undefined
  return {
    originalValue: change.originalValue,
    onUndo: () => onUndo(change),
    fieldId: `field-${path.join('-')}`,
  }
}
