import {
  allergenEnum,
  PRODUCT_SECTION_FIELD_LABELS,
  PRODUCT_SECTION_LABELS,
  type ProductSectionKey,
  productSectionKeys,
} from '@app/db/data-schemas'
import { useMemo } from 'react'

import { getNestedValue } from '@/lib/nested-value'

export type FieldChange = {
  key: string
  path: string[]
  label: string
  originalValue: unknown
  currentValue: unknown
  type: 'top-level' | 'data'
}

/** Treat undefined, null, and empty string as equivalent "empty" */
function valuesEqual(a: unknown, b: unknown): boolean {
  const normalize = (v: unknown) =>
    v === undefined || v === null || v === '' ? null : v
  const na = normalize(a)
  const nb = normalize(b)
  if (na === nb) return true
  if (na === null || nb === null) return false
  if (typeof na === 'object' && typeof nb === 'object') {
    return JSON.stringify(na) === JSON.stringify(nb)
  }
  return false
}

function walkLabels(
  labels: Record<string, unknown>,
  originalData: unknown,
  currentData: unknown,
  pathPrefix: string[],
  labelPrefix: string,
  changes: FieldChange[],
) {
  for (const [key, labelOrNested] of Object.entries(labels)) {
    const path = [...pathPrefix, key]
    if (typeof labelOrNested === 'string') {
      const original = getNestedValue(originalData, path)
      const current = getNestedValue(currentData, path)
      if (!valuesEqual(original, current)) {
        changes.push({
          key: path.join('.'),
          path,
          label: labelPrefix
            ? `${labelPrefix} \u2192 ${labelOrNested}`
            : labelOrNested,
          originalValue: original,
          currentValue: current,
          type: 'data',
        })
      }
    } else if (typeof labelOrNested === 'object' && labelOrNested !== null) {
      walkLabels(
        labelOrNested as Record<string, unknown>,
        originalData,
        currentData,
        path,
        labelPrefix,
        changes,
      )
    }
  }
}

export function useProductChanges({
  originalName,
  originalCategory,
  originalData,
  currentName,
  currentCategory,
  currentData,
}: {
  originalName: string
  originalCategory: string
  originalData: Record<string, unknown>
  currentName: string
  currentCategory: string
  currentData: Record<string, unknown>
}) {
  const changes = useMemo(() => {
    const result: FieldChange[] = []

    // Top-level fields
    if (!valuesEqual(originalName, currentName)) {
      result.push({
        key: 'name',
        path: ['name'],
        label: 'Name',
        originalValue: originalName,
        currentValue: currentName,
        type: 'top-level',
      })
    }
    if (!valuesEqual(originalCategory, currentCategory)) {
      result.push({
        key: 'category',
        path: ['category'],
        label: 'Category',
        originalValue: originalCategory,
        currentValue: currentCategory,
        type: 'top-level',
      })
    }

    // Walk section field labels
    for (const [sectionKey, sectionLabels] of Object.entries(
      PRODUCT_SECTION_FIELD_LABELS,
    )) {
      const sectionLabel =
        PRODUCT_SECTION_LABELS[sectionKey as ProductSectionKey] ?? sectionKey
      walkLabels(
        sectionLabels as Record<string, unknown>,
        originalData,
        currentData,
        [sectionKey],
        sectionLabel,
        result,
      )
    }

    // Allergens (dynamic record keys)
    for (const allergen of allergenEnum.options) {
      const path = ['allergens', 'allergens', allergen]
      const original = getNestedValue(originalData, path)
      const current = getNestedValue(currentData, path)
      if (!valuesEqual(original, current)) {
        result.push({
          key: path.join('.'),
          path,
          label: `Allergens \u2192 ${allergen.charAt(0).toUpperCase() + allergen.slice(1)}`,
          originalValue: original,
          currentValue: current,
          type: 'data',
        })
      }
    }

    // Section toggles
    for (const key of productSectionKeys) {
      const path = ['sections', key]
      const original = getNestedValue(originalData, path)
      const current = getNestedValue(currentData, path)
      if (!valuesEqual(original, current)) {
        result.push({
          key: path.join('.'),
          path,
          label: `${PRODUCT_SECTION_LABELS[key]} (enabled)`,
          originalValue: original,
          currentValue: current,
          type: 'data',
        })
      }
    }

    return result
  }, [
    originalName,
    originalCategory,
    originalData,
    currentName,
    currentCategory,
    currentData,
  ])

  const changesMap = useMemo(() => {
    const map: Record<string, FieldChange> = {}
    for (const change of changes) {
      map[change.key] = change
    }
    return map
  }, [changes])

  return {
    changes,
    changeCount: changes.length,
    changesMap,
  }
}
