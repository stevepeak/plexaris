'use client'

import {
  type Product,
  PRODUCT_SECTION_LABELS,
  type ProductSectionKey,
  productSectionKeys,
} from '@app/db/data-schemas'
import {
  ArrowLeft,
  Box,
  Camera,
  CircleDollarSign,
  Eye,
  History,
  Info,
  Leaf,
  Loader2,
  Moon,
  Package,
  Pencil,
  ShieldAlert,
  Sprout,
  Star,
  Tag,
  Thermometer,
  Undo2,
  UtensilsCrossed,
  Warehouse,
  WheatOff,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { ProductSections } from '@/components/order/product-detail'
import { ProductChangesPopover } from '@/components/product-changes-popover'
import { ProductImageManager } from '@/components/product-image-manager'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  type FieldChange,
  useProductChanges,
} from '@/hooks/use-product-changes'
import { getNestedValue, setNestedValue } from '@/lib/nested-value'
import { getCategoryIcon, PRODUCT_CATEGORIES } from '@/lib/product-categories'
import { uploadFiles } from '@/lib/upload'
import { cn } from '@/lib/utils'

const SECTION_ICONS: Record<
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

const EU_ALLERGENS = [
  'milk',
  'fish',
  'crustaceans',
  'gluten',
  'eggs',
  'peanuts',
  'nuts',
  'sesame',
  'soy',
  'celery',
  'mustard',
  'sulfites',
  'lupin',
  'molluscs',
] as const

const ALLERGEN_STATUSES = ['contains', 'may_contain', 'absent'] as const

type ProductFormData = {
  name: string
  category: string
  note?: string
  data?: Partial<Product>
}

type ProductFormProps = {
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

export function ProductForm({
  productId,
  product,
  onSubmit,
  onCancel,
  onViewHistory,
  isPending,
}: ProductFormProps) {
  const isEditing = !!product

  const [name, setName] = useState(product?.name ?? '')
  const [category, setCategory] = useState(product?.category ?? '')
  const [note, setNote] = useState('')
  const [data, setData] = useState<Record<string, unknown>>(
    (product?.data as Record<string, unknown>) ?? {},
  )
  const [openSections, setOpenSections] = useState<string[]>(() => {
    const s = ((product?.data as Record<string, unknown>)?.sections ??
      {}) as Record<string, boolean>
    return [...productSectionKeys.filter((key) => s[key] !== false)]
  })

  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Snapshot of original values for change tracking
  const originalNameRef = useRef(product?.name ?? '')
  const originalCategoryRef = useRef(product?.category ?? '')
  const originalDataRef = useRef<Record<string, unknown>>(
    (product?.data as Record<string, unknown>) ?? {},
  )

  useEffect(() => {
    if (product) {
      setName(product.name)
      setCategory(product.category ?? '')
      setNote('')
      const d = (product.data as Record<string, unknown>) ?? {}
      setData(d)
      originalNameRef.current = product.name
      originalCategoryRef.current = product.category ?? ''
      originalDataRef.current = d
    }
  }, [product])

  const { changes, changeCount, changesMap } = useProductChanges({
    originalName: originalNameRef.current,
    originalCategory: originalCategoryRef.current,
    originalData: originalDataRef.current,
    currentName: name,
    currentCategory: category,
    currentData: data,
  })

  if (isPending) {
    return (
      <div className="space-y-4">
        <div className="h-5 w-40 animate-pulse rounded bg-muted" />
        <div className="h-4 w-56 animate-pulse rounded bg-muted" />
        <div className="h-9 animate-pulse rounded bg-muted" />
        <div className="h-20 animate-pulse rounded bg-muted" />
        <div className="h-9 animate-pulse rounded bg-muted" />
      </div>
    )
  }

  const sections = (data.sections ?? {}) as Record<string, boolean>

  const isSectionEnabled = (key: ProductSectionKey) => sections[key] !== false

  const toggleSection = (key: ProductSectionKey) => {
    const wasEnabled = isSectionEnabled(key)
    setData((prev) =>
      setNestedValue(prev, ['sections'], {
        ...((prev.sections ?? {}) as Record<string, boolean>),
        [key]: !wasEnabled,
      }),
    )
    if (wasEnabled) {
      // Collapse when disabling
      setOpenSections((prev) => prev.filter((k) => k !== key))
    } else {
      // Expand when enabling
      setOpenSections((prev) => (prev.includes(key) ? prev : [...prev, key]))
    }
  }

  const updateField = (path: string[], value: unknown) => {
    setData((prev) => setNestedValue(prev, path, value))
  }

  const getFieldString = (path: string[]) =>
    (getNestedValue(data, path) as string) ?? ''

  const getFieldNumber = (path: string[]) => {
    const v = getNestedValue(data, path)
    return v != null ? String(v) : ''
  }

  const getFieldChange = (path: string[]): FieldChange | undefined =>
    changesMap[path.join('.')]

  const undoChange = (change: FieldChange) => {
    if (change.type === 'top-level') {
      if (change.key === 'name') setName(change.originalValue as string)
      if (change.key === 'category') {
        setCategory(change.originalValue as string)
      }
    } else {
      updateField(change.path, change.originalValue)
    }
  }

  const navigateToChange = (change: FieldChange) => {
    const fieldId = `field-${change.path.join('-')}`
    const el = document.getElementById(fieldId)
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    setTimeout(() => {
      el.style.boxShadow = '0 0 0 2px rgb(251 191 36 / 0.5)'
      el.style.borderRadius = '6px'
      el.style.transition = 'box-shadow 0.3s ease-in'
      setTimeout(() => {
        el.style.transition =
          'box-shadow 1s ease-out, border-radius 1s ease-out'
        el.style.boxShadow = ''
        setTimeout(() => {
          el.style.transition = ''
          el.style.borderRadius = ''
        }, 1000)
      }, 1200)
    }, 300)
  }

  const doSubmit = async () => {
    if (!onSubmit) return
    setIsLoading(true)
    setError(null)
    const result = await onSubmit({
      name,
      category,
      ...(isEditing && note ? { note } : {}),
      data: data as Partial<Product>,
    })
    if (result.error) {
      setError(result.error)
    }
    setIsLoading(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    void doSubmit()
  }

  const saveLabel = isLoading ? (
    <>
      <Loader2 className="h-4 w-4 animate-spin" />
      Saving...
    </>
  ) : isEditing && changeCount > 0 ? (
    `Save (${changeCount}) ${changeCount === 1 ? 'change' : 'changes'}`
  ) : isEditing ? (
    'Save changes'
  ) : (
    'Add product'
  )

  return (
    <div className="grid gap-4 pb-16">
      {/* Header */}
      <div className="flex items-center gap-3">
        {onCancel && (
          <Button variant="ghost" size="icon" onClick={onCancel} type="button">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
        <div className="flex-1">
          <h2 className="text-lg font-semibold">
            {isEditing ? 'Edit product' : 'Add product'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {isEditing
              ? 'Update your product details'
              : 'Add a new product to your catalog'}
          </p>
        </div>
      </div>

      {/* Content: edit form or preview */}
      {viewMode === 'preview' ? (
        <div className="flex flex-col gap-4">
          <div>
            {category && (
              <span className="text-xs text-muted-foreground">{category}</span>
            )}
            <h3 className="text-lg font-semibold">
              {name || 'Untitled product'}
            </h3>
          </div>
          <ProductSections data={data} />
        </div>
      ) : (
        <form
          id="product-edit-form"
          onSubmit={handleSubmit}
          className="grid gap-4"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2" id="field-name">
              <FieldLabel
                htmlFor="product-name"
                change={
                  getFieldChange(['name'])
                    ? {
                        originalValue: getFieldChange(['name'])!.originalValue,
                        onUndo: () => undoChange(getFieldChange(['name'])!),
                      }
                    : undefined
                }
              >
                Name
              </FieldLabel>
              <Input
                id="product-name"
                type="text"
                placeholder="e.g. Sourdough Bread"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2" id="field-category">
              <FieldLabel
                htmlFor="product-category"
                change={
                  getFieldChange(['category'])
                    ? {
                        originalValue: getFieldChange(['category'])!
                          .originalValue,
                        onUndo: () => undoChange(getFieldChange(['category'])!),
                      }
                    : undefined
                }
              >
                Category
              </FieldLabel>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="product-category">
                  {category ? (
                    <span className="!flex items-center gap-2">
                      {(() => {
                        const Icon = getCategoryIcon(category)
                        return Icon ? (
                          <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                        ) : null
                      })()}
                      {category}
                    </span>
                  ) : (
                    <SelectValue placeholder="Select category" />
                  )}
                </SelectTrigger>
                <SelectContent>
                  {PRODUCT_CATEGORIES.map((c) => (
                    <SelectItem key={c.label} value={c.label}>
                      <span className="flex items-center gap-2">
                        <c.icon className="h-4 w-4 text-muted-foreground" />
                        {c.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Section cards */}
          <Accordion
            type="multiple"
            value={openSections}
            onValueChange={setOpenSections}
            className="grid gap-4"
          >
            {productSectionKeys.map((key) => {
              const enabled = isSectionEnabled(key)
              return (
                <AccordionItem
                  key={key}
                  value={key}
                  id={`field-sections-${key}`}
                  className={cn('border-b-0', !enabled && 'opacity-50')}
                >
                  <Separator />
                  <div className="flex items-center gap-2 pt-6 pb-2">
                    <div className="min-w-0 flex-1">
                      <AccordionTrigger className="text-base font-semibold hover:no-underline">
                        <span className="flex items-center gap-2">
                          {(() => {
                            const Icon = SECTION_ICONS[key]
                            return (
                              <Icon className="h-4 w-4 text-muted-foreground" />
                            )
                          })()}
                          {PRODUCT_SECTION_LABELS[key]}
                        </span>
                      </AccordionTrigger>
                    </div>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div>
                            <Switch
                              icons
                              checked={enabled}
                              onCheckedChange={() => toggleSection(key)}
                            />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="left">
                          {enabled ? 'Disable section' : 'Enable section'}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <AccordionContent>
                    <div className="grid gap-3 pt-2">
                      <SectionFields
                        sectionKey={key}
                        getFieldString={getFieldString}
                        getFieldNumber={getFieldNumber}
                        updateField={updateField}
                        data={data}
                        fc={getFieldChange}
                        onUndo={undoChange}
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )
            })}
          </Accordion>

          {isEditing && (
            <div className="pt-6">
              <Separator />
              <div className="grid gap-2 pt-6">
                <Label htmlFor="product-note">Edit note</Label>
                <Textarea
                  id="product-note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={2}
                />
                <p className="text-xs text-muted-foreground">
                  For internal purposes only
                </p>
              </div>
            </div>
          )}
        </form>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* Sticky bottom action bar */}
      <div className="sticky bottom-0 -mx-1 border-t bg-background px-1 py-3">
        <div className="flex items-center gap-2">
          {isEditing && (
            <ProductChangesPopover
              changes={changes}
              onUndo={undoChange}
              onNavigate={navigateToChange}
            />
          )}
          {isEditing && (
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() =>
                setViewMode((m) => (m === 'edit' ? 'preview' : 'edit'))
              }
            >
              {viewMode === 'edit' ? (
                <>
                  <Eye className="mr-2 h-4 w-4" />
                  Preview
                </>
              ) : (
                <>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </>
              )}
            </Button>
          )}
          <div className="flex-1" />
          {onViewHistory && (
            <Button
              variant="ghost"
              size="sm"
              type="button"
              onClick={onViewHistory}
            >
              <History className="mr-2 h-4 w-4" />
              History
            </Button>
          )}
          {onCancel && (
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={onCancel}
            >
              Cancel
            </Button>
          )}
          <Button
            size="sm"
            disabled={isLoading}
            type="button"
            onClick={() => void doSubmit()}
          >
            {saveLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── Field Label with Undo ──────────────────────────────────────────────────

function formatChangeValue(value: unknown): string {
  if (value === null || value === undefined || value === '') return '(empty)'
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  return String(value)
}

function FieldLabel({
  children,
  htmlFor,
  change,
}: {
  children: React.ReactNode
  htmlFor?: string
  change?: { originalValue: unknown; onUndo: () => void }
}) {
  return (
    <div className="flex items-center gap-1.5">
      <Label htmlFor={htmlFor}>{children}</Label>
      {change && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={change.onUndo}
                className="rounded p-0.5 hover:bg-muted"
              >
                <Undo2 className="h-3 w-3 text-amber-500" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              Was: {formatChangeValue(change.originalValue)}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  )
}

// ─── Per-Section Field Components ──────────────────────────────────────────

type ChangeInfo = {
  originalValue: unknown
  onUndo: () => void
  fieldId: string
}

type SectionFieldsProps = {
  sectionKey: ProductSectionKey
  getFieldString: (path: string[]) => string
  getFieldNumber: (path: string[]) => string
  updateField: (path: string[], value: unknown) => void
  data: Record<string, unknown>
  fc: (path: string[]) => FieldChange | undefined
  onUndo: (change: FieldChange) => void
}

/** Build a ChangeInfo from a FieldChange, or undefined */
function ci(
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

function SectionFields({
  sectionKey,
  getFieldString,
  getFieldNumber,
  updateField,
  data,
  fc,
  onUndo,
}: SectionFieldsProps) {
  switch (sectionKey) {
    case 'general':
      return (
        <GeneralFields
          g={getFieldString}
          u={updateField}
          fc={fc}
          undo={onUndo}
        />
      )
    case 'photos':
      return <PhotosFields data={data} u={updateField} />
    case 'unit':
      return (
        <PackagingFields
          section="unit"
          g={getFieldString}
          gn={getFieldNumber}
          u={updateField}
          weightUnit="grams"
          dimUnit="mm"
          showUnitsPerCase={false}
          fc={fc}
          undo={onUndo}
        />
      )
    case 'case':
      return (
        <PackagingFields
          section="case"
          g={getFieldString}
          gn={getFieldNumber}
          u={updateField}
          weightUnit="grams"
          dimUnit="mm"
          showUnitsPerCase
          fc={fc}
          undo={onUndo}
        />
      )
    case 'pallet':
      return (
        <PalletFields
          gn={getFieldNumber}
          g={getFieldString}
          u={updateField}
          fc={fc}
          undo={onUndo}
        />
      )
    case 'ingredients':
      return (
        <IngredientsFields
          g={getFieldString}
          gn={getFieldNumber}
          u={updateField}
          fc={fc}
          undo={onUndo}
        />
      )
    case 'nutrition':
      return (
        <NutritionFields
          gn={getFieldNumber}
          u={updateField}
          fc={fc}
          undo={onUndo}
        />
      )
    case 'allergens':
      return (
        <AllergensFields data={data} u={updateField} fc={fc} undo={onUndo} />
      )
    case 'dietary':
      return <DietaryFields data={data} u={updateField} fc={fc} undo={onUndo} />
    case 'storage':
      return (
        <StorageFields
          g={getFieldString}
          gn={getFieldNumber}
          u={updateField}
          fc={fc}
          undo={onUndo}
        />
      )
    case 'pricing':
      return (
        <PricingFields
          gn={getFieldNumber}
          u={updateField}
          fc={fc}
          undo={onUndo}
        />
      )
    case 'label':
      return (
        <LabelFields
          g={getFieldString}
          u={updateField}
          data={data}
          fc={fc}
          undo={onUndo}
        />
      )
    default:
      return null
  }
}

// ─── General ─────────────────────────────────────────────────────────────────

type FCProp = {
  fc: (path: string[]) => FieldChange | undefined
  undo: (change: FieldChange) => void
}

function GeneralFields({
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

// ─── Photos ──────────────────────────────────────────────────────────────────

function PhotosFields({
  data,
  u,
}: {
  data: Record<string, unknown>
  u: (p: string[], v: unknown) => void
}) {
  const photos = (data.photos as Record<string, unknown>) ?? {}
  const images = (photos.images as string[]) ?? []

  const handleAdd = async (files: File[]): Promise<{ error?: string }> => {
    const { urls, error } = await uploadFiles(files, 'products')
    if (error) return { error }
    u(['photos', 'images'], [...images, ...urls])
    return {}
  }

  const handleRemove = async (index: number): Promise<{ error?: string }> => {
    u(
      ['photos', 'images'],
      images.filter((_, i) => i !== index),
    )
    return {}
  }

  return (
    <ProductImageManager
      images={images}
      disabled={false}
      onAdd={handleAdd}
      onRemove={handleRemove}
    />
  )
}

// ─── Packaging (Unit & Case) ─────────────────────────────────────────────────

function PackagingFields({
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

// ─── Pallet ──────────────────────────────────────────────────────────────────

const PALLET_TYPES = [
  { value: 'euro', label: 'Euro Pallet (EPAL/EUR)', size: '120 x 80 cm' },
  { value: 'chep', label: 'CHEP Pallet', size: '120 x 100 cm' },
  {
    value: 'block',
    label: 'Block Pallet / Industrial',
    size: '120 x 100 cm',
  },
] as const

function PalletFields({
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

// ─── Ingredients ─────────────────────────────────────────────────────────────

function IngredientsFields({
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

// ─── Nutrition ───────────────────────────────────────────────────────────────

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

function NutritionFields({
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

// ─── Allergens ───────────────────────────────────────────────────────────────

function AllergensFields({
  data,
  u,
  fc,
  undo,
}: {
  data: Record<string, unknown>
  u: (p: string[], v: unknown) => void
} & FCProp) {
  const allergenData = (data.allergens as Record<string, unknown>) ?? {}
  const allergenMap = (allergenData.allergens as Record<string, string>) ?? {}

  return (
    <div className="grid gap-4">
      <p className="text-xs text-muted-foreground">EU-14 allergens</p>
      <div className="grid grid-cols-2 gap-4">
        {EU_ALLERGENS.map((allergen) => (
          <div
            key={allergen}
            id={`field-allergens-allergens-${allergen}`}
            className="flex items-center gap-3"
          >
            <FieldLabel
              change={ci(fc, undo, ['allergens', 'allergens', allergen])}
            >
              <span className="w-24 text-sm capitalize">{allergen}</span>
            </FieldLabel>
            <Select
              value={allergenMap[allergen] ?? ''}
              onValueChange={(v) => {
                const updated = { ...allergenMap, [allergen]: v }
                u(['allergens', 'allergens'], updated)
              }}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Not set" />
              </SelectTrigger>
              <SelectContent>
                {ALLERGEN_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s.replace(/_/g, ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Dietary ─────────────────────────────────────────────────────────────────

const DIETARY_CONFIG = [
  {
    key: 'kosher',
    label: 'Kosher',
    icon: Star,
    activeClasses: 'border-blue-400',
    iconColor: 'text-blue-600',
  },
  {
    key: 'halal',
    label: 'Halal',
    icon: Moon,
    activeClasses: 'border-green-400',
    iconColor: 'text-green-600',
  },
  {
    key: 'vegetarian',
    label: 'Vegetarian',
    icon: Leaf,
    activeClasses: 'border-emerald-400',
    iconColor: 'text-emerald-600',
  },
  {
    key: 'vegan',
    label: 'Vegan',
    icon: Sprout,
    activeClasses: 'border-teal-400',
    iconColor: 'text-teal-600',
  },
] as const

function DietaryFields({
  data,
  u,
  fc,
  undo,
}: {
  data: Record<string, unknown>
  u: (p: string[], v: unknown) => void
} & FCProp) {
  const dietary = (data.dietary as Record<string, boolean>) ?? {}

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {DIETARY_CONFIG.map((item) => {
        const isActive = dietary[item.key] ?? false
        const change = ci(fc, undo, ['dietary', item.key])
        return (
          <div
            key={item.key}
            id={`field-dietary-${item.key}`}
            className={cn(
              'relative flex flex-col items-center gap-2 rounded-lg border p-3 transition-all',
              isActive ? item.activeClasses : 'opacity-40',
            )}
          >
            {change && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={change.onUndo}
                      className="absolute top-1.5 right-1.5 rounded p-0.5 hover:bg-muted"
                    >
                      <Undo2 className="h-3 w-3 text-amber-500" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    Was: {formatChangeValue(change.originalValue)}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            <item.icon
              className={cn(
                'h-6 w-6',
                isActive ? item.iconColor : 'text-muted-foreground',
              )}
            />
            <span className="text-xs font-medium">{item.label}</span>
            <Switch
              checked={isActive}
              onCheckedChange={(checked) => u(['dietary', item.key], !!checked)}
            />
          </div>
        )
      })}
    </div>
  )
}

// ─── Storage ─────────────────────────────────────────────────────────────────

function StorageFields({
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

// ─── Pricing ─────────────────────────────────────────────────────────────────

function PricingFields({
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

// ─── Label ───────────────────────────────────────────────────────────────────

function LabelFields({
  g,
  u,
  data,
  fc,
  undo,
}: {
  g: (p: string[]) => string
  u: (p: string[], v: unknown) => void
  data: Record<string, unknown>
} & FCProp) {
  const labelData = (data.label as Record<string, unknown>) ?? {}
  const labelImages = (labelData.labelImages as string[]) ?? []

  const handleAddLabelImages = async (
    files: File[],
  ): Promise<{ error?: string }> => {
    const { urls, error } = await uploadFiles(files, 'products')
    if (error) return { error }
    u(['label', 'labelImages'], [...labelImages, ...urls])
    return {}
  }

  const handleRemoveLabelImage = async (
    index: number,
  ): Promise<{ error?: string }> => {
    u(
      ['label', 'labelImages'],
      labelImages.filter((_, i) => i !== index),
    )
    return {}
  }

  return (
    <>
      <div className="grid gap-2">
        <Label>Label images</Label>
        <ProductImageManager
          images={labelImages}
          disabled={false}
          onAdd={handleAddLabelImages}
          onRemove={handleRemoveLabelImage}
        />
      </div>
      <div className="grid gap-2" id="field-label-cartonPrint">
        <FieldLabel change={ci(fc, undo, ['label', 'cartonPrint'])}>
          Carton print
        </FieldLabel>
        <Textarea
          value={g(['label', 'cartonPrint'])}
          onChange={(e) => u(['label', 'cartonPrint'], e.target.value)}
          rows={3}
          placeholder="Text/info printed on outer carton"
        />
      </div>
    </>
  )
}

// ─── Shared Field Components ─────────────────────────────────────────────────

function FieldInput({
  label,
  value,
  onChange,
  placeholder,
  change,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  change?: ChangeInfo
}) {
  return (
    <div className="grid gap-2" id={change?.fieldId}>
      <FieldLabel change={change}>{label}</FieldLabel>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  )
}

function FieldNumber({
  label,
  value,
  onChange,
  change,
}: {
  label: string
  value: string
  onChange: (v: number | undefined) => void
  change?: ChangeInfo
}) {
  return (
    <div className="grid gap-2" id={change?.fieldId}>
      <FieldLabel change={change}>{label}</FieldLabel>
      <Input
        type="number"
        step="any"
        value={value}
        onChange={(e) => {
          const v = e.target.value
          onChange(v === '' ? undefined : Number(v))
        }}
      />
    </div>
  )
}
