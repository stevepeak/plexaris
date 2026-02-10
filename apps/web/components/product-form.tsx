'use client'

import {
  type Product,
  PRODUCT_SECTION_LABELS,
  type ProductSectionKey,
  productSectionKeys,
} from '@app/db/data-schemas'
import { ArrowLeft, Leaf, Loader2, Moon, Sprout, Star } from 'lucide-react'
import { useEffect, useState } from 'react'

import { ProductImageManager } from '@/components/product-image-manager'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

const CATEGORIES = [
  'Bread',
  'Pastry',
  'Dairy',
  'Meat',
  'Fish',
  'Produce',
  'Beverages',
  'Ingredients',
  'Other',
] as const

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
  isPending?: boolean
}

// Helper to update a nested path in the data blob
function setNestedValue(
  obj: Record<string, unknown>,
  path: string[],
  value: unknown,
): Record<string, unknown> {
  const result = { ...obj }
  if (path.length === 1) {
    result[path[0]] = value
    return result
  }
  const [head, ...rest] = path
  result[head] = setNestedValue(
    (result[head] as Record<string, unknown>) ?? {},
    rest,
    value,
  )
  return result
}

function getNestedValue(obj: unknown, path: string[]): unknown {
  let current = obj
  for (const key of path) {
    if (current == null || typeof current !== 'object') {
      return undefined
    }
    current = (current as Record<string, unknown>)[key]
  }
  return current
}

export function ProductForm({
  product,
  onSubmit,
  onCancel,
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

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (product) {
      setName(product.name)
      setCategory(product.category ?? '')
      setNote('')
      setData((product.data as Record<string, unknown>) ?? {})
    }
  }, [product])

  if (isPending) {
    return (
      <Card>
        <CardHeader>
          <div className="h-5 w-40 animate-pulse rounded bg-muted" />
          <div className="h-4 w-56 animate-pulse rounded bg-muted" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-9 animate-pulse rounded bg-muted" />
          <div className="h-20 animate-pulse rounded bg-muted" />
          <div className="h-9 animate-pulse rounded bg-muted" />
        </CardContent>
      </Card>
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
    // Collapse when disabling
    if (wasEnabled) {
      setOpenSections((prev) => prev.filter((k) => k !== key))
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!onSubmit) {
      return
    }
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

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <div className="flex items-center gap-3">
        {onCancel && (
          <Button variant="ghost" size="icon" onClick={onCancel} type="button">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
        <div>
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

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="product-name">Name</Label>
          <Input
            id="product-name"
            type="text"
            placeholder="e.g. Sourdough Bread"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="product-category">Category</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger id="product-category">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
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
            <AccordionItem key={key} value={key} className="border-b-0">
              <Card className={cn(!enabled && 'opacity-50')}>
                <CardHeader className="py-3">
                  <div className="flex items-center gap-2">
                    <div className="min-w-0 flex-1">
                      <AccordionTrigger className="hover:no-underline">
                        {PRODUCT_SECTION_LABELS[key]}
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
                </CardHeader>
                <AccordionContent className="pb-0">
                  <CardContent className="pt-0">
                    <div className="grid gap-3">
                      <SectionFields
                        sectionKey={key}
                        getFieldString={getFieldString}
                        getFieldNumber={getFieldNumber}
                        updateField={updateField}
                        data={data}
                      />
                    </div>
                  </CardContent>
                </AccordionContent>
              </Card>
            </AccordionItem>
          )
        })}
      </Accordion>

      {isEditing && (
        <Card className="bg-muted/50">
          <CardContent className="py-4">
            <div className="grid gap-2">
              <Label htmlFor="product-note">Edit note</Label>
              <Textarea
                id="product-note"
                placeholder="What changed?"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
              />
              <p className="text-xs text-muted-foreground">
                For internal purposes only
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-3">
        <Button type="submit" disabled={isLoading} className="w-fit">
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : isEditing ? (
            'Save changes'
          ) : (
            'Add product'
          )}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="w-fit"
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  )
}

// ─── Per-Section Field Components ──────────────────────────────────────────

type SectionFieldsProps = {
  sectionKey: ProductSectionKey
  getFieldString: (path: string[]) => string
  getFieldNumber: (path: string[]) => string
  updateField: (path: string[], value: unknown) => void
  data: Record<string, unknown>
}

function SectionFields({
  sectionKey,
  getFieldString,
  getFieldNumber,
  updateField,
  data,
}: SectionFieldsProps) {
  switch (sectionKey) {
    case 'general':
      return <GeneralFields g={getFieldString} u={updateField} />
    case 'photos':
      return <PhotosFields data={data} />
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
        />
      )
    case 'pallet':
      return (
        <PalletFields gn={getFieldNumber} g={getFieldString} u={updateField} />
      )
    case 'ingredients':
      return (
        <IngredientsFields
          g={getFieldString}
          gn={getFieldNumber}
          u={updateField}
        />
      )
    case 'nutrition':
      return <NutritionFields gn={getFieldNumber} u={updateField} />
    case 'allergens':
      return <AllergensFields data={data} u={updateField} />
    case 'dietary':
      return <DietaryFields data={data} u={updateField} />
    case 'storage':
      return (
        <StorageFields g={getFieldString} gn={getFieldNumber} u={updateField} />
      )
    case 'pricing':
      return <PricingFields gn={getFieldNumber} u={updateField} />
    case 'label':
      return <LabelFields g={getFieldString} u={updateField} data={data} />
    default:
      return null
  }
}

// ─── General ─────────────────────────────────────────────────────────────────

function GeneralFields({
  g,
  u,
}: {
  g: (p: string[]) => string
  u: (p: string[], v: unknown) => void
}) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <FieldInput
          label="Brand"
          value={g(['general', 'brand'])}
          onChange={(v) => u(['general', 'brand'], v)}
        />
        <FieldInput
          label="Variant"
          value={g(['general', 'variant'])}
          onChange={(v) => u(['general', 'variant'], v)}
        />
      </div>
      <div className="grid gap-2">
        <Label>Description</Label>
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
        />
        <FieldInput
          label="Intrastat code"
          value={g(['general', 'intrastatCode'])}
          onChange={(v) => u(['general', 'intrastatCode'], v)}
          placeholder="8 digits"
        />
        <FieldInput
          label="Country of origin"
          value={g(['general', 'countryOfOrigin'])}
          onChange={(v) => u(['general', 'countryOfOrigin'], v)}
          placeholder="e.g. NL"
        />
      </div>
    </>
  )
}

// ─── Photos ──────────────────────────────────────────────────────────────────

function PhotosFields({ data }: { data: Record<string, unknown> }) {
  const photos = (data.photos as Record<string, unknown>) ?? {}
  const images = (photos.images as string[]) ?? []
  return <ProductImageManager images={images} disabled />
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
}: {
  section: 'unit' | 'case'
  g: (p: string[]) => string
  gn: (p: string[]) => string
  u: (p: string[], v: unknown) => void
  weightUnit: string
  dimUnit: string
  showUnitsPerCase: boolean
}) {
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
      />
      <p className="text-xs font-medium text-muted-foreground">
        Dimensions ({dimUnit})
      </p>
      <div className="grid gap-4 sm:grid-cols-3">
        <FieldNumber
          label="Height"
          value={gn([section, 'dimensions', 'height'])}
          onChange={(v) => u([section, 'dimensions', 'height'], v)}
        />
        <FieldNumber
          label="Width"
          value={gn([section, 'dimensions', 'width'])}
          onChange={(v) => u([section, 'dimensions', 'width'], v)}
        />
        <FieldNumber
          label="Depth"
          value={gn([section, 'dimensions', 'depth'])}
          onChange={(v) => u([section, 'dimensions', 'depth'], v)}
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
        />
        <FieldNumber
          label="Net"
          value={gn([section, 'weight', 'net'])}
          onChange={(v) => u([section, 'weight', 'net'], v)}
        />
      </div>
      <p className="text-xs font-medium text-muted-foreground">Net content</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <FieldNumber
          label="Milliliters"
          value={gn([section, 'netContent', 'milliliters'])}
          onChange={(v) => u([section, 'netContent', 'milliliters'], v)}
        />
        <FieldNumber
          label="Grams"
          value={gn([section, 'netContent', 'grams'])}
          onChange={(v) => u([section, 'netContent', 'grams'], v)}
        />
      </div>
      {showUnitsPerCase && (
        <FieldNumber
          label="Units per case"
          value={gn([section, 'unitsPerCase'])}
          onChange={(v) => u([section, 'unitsPerCase'], v)}
        />
      )}
      <div className="grid gap-2">
        <Label>Packaging type</Label>
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

function PalletFields({
  gn,
  g,
  u,
}: {
  gn: (p: string[]) => string
  g: (p: string[]) => string
  u: (p: string[], v: unknown) => void
}) {
  return (
    <>
      <FieldInput
        label="GTIN / EAN"
        value={g(['pallet', 'gtin'])}
        onChange={(v) => u(['pallet', 'gtin'], v)}
      />
      <div className="grid gap-2">
        <Label>Pallet type</Label>
        <Select
          value={g(['pallet', 'palletType'])}
          onValueChange={(v) => u(['pallet', 'palletType'], v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="euro">Euro</SelectItem>
            <SelectItem value="chep">CHEP</SelectItem>
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
        />
        <FieldNumber
          label="Cases / layer"
          value={gn(['pallet', 'load', 'casesPerLayer'])}
          onChange={(v) => u(['pallet', 'load', 'casesPerLayer'], v)}
        />
        <FieldNumber
          label="Cases / pallet"
          value={gn(['pallet', 'load', 'casesPerPallet'])}
          onChange={(v) => u(['pallet', 'load', 'casesPerPallet'], v)}
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
        />
        <FieldNumber
          label="Height (without product)"
          value={gn(['pallet', 'dimensions', 'heightWithoutProduct'])}
          onChange={(v) =>
            u(['pallet', 'dimensions', 'heightWithoutProduct'], v)
          }
        />
        <FieldNumber
          label="Width"
          value={gn(['pallet', 'dimensions', 'width'])}
          onChange={(v) => u(['pallet', 'dimensions', 'width'], v)}
        />
        <FieldNumber
          label="Depth"
          value={gn(['pallet', 'dimensions', 'depth'])}
          onChange={(v) => u(['pallet', 'dimensions', 'depth'], v)}
        />
      </div>
      <p className="text-xs font-medium text-muted-foreground">Weight (kg)</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <FieldNumber
          label="Gross"
          value={gn(['pallet', 'weight', 'gross'])}
          onChange={(v) => u(['pallet', 'weight', 'gross'], v)}
        />
        <FieldNumber
          label="Net"
          value={gn(['pallet', 'weight', 'net'])}
          onChange={(v) => u(['pallet', 'weight', 'net'], v)}
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
}: {
  g: (p: string[]) => string
  gn: (p: string[]) => string
  u: (p: string[], v: unknown) => void
}) {
  return (
    <>
      <div className="grid gap-2">
        <Label>Ingredients list</Label>
        <Textarea
          value={g(['ingredients', 'ingredients'])}
          onChange={(e) => u(['ingredients', 'ingredients'], e.target.value)}
          rows={4}
          placeholder="Full ingredient list as shown on label"
        />
      </div>
      <div className="grid gap-2">
        <Label>Warning statements</Label>
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
        />
        <FieldNumber
          label="Amount (%)"
          value={gn(['ingredients', 'palmOil', 'amountPercent'])}
          onChange={(v) => u(['ingredients', 'palmOil', 'amountPercent'], v)}
        />
        <FieldInput
          label="RSPO certificate"
          value={g(['ingredients', 'palmOil', 'rspoCertificate'])}
          onChange={(v) => u(['ingredients', 'palmOil', 'rspoCertificate'], v)}
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
}: {
  gn: (p: string[]) => string
  u: (p: string[], v: unknown) => void
}) {
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
}: {
  data: Record<string, unknown>
  u: (p: string[], v: unknown) => void
}) {
  const allergenData = (data.allergens as Record<string, unknown>) ?? {}
  const allergenMap = (allergenData.allergens as Record<string, string>) ?? {}

  return (
    <div className="grid gap-2">
      <p className="text-xs text-muted-foreground">EU-14 allergens</p>
      {EU_ALLERGENS.map((allergen) => (
        <div key={allergen} className="flex items-center gap-3">
          <span className="w-24 text-sm capitalize">{allergen}</span>
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
  )
}

// ─── Dietary ─────────────────────────────────────────────────────────────────

const DIETARY_CONFIG = [
  {
    key: 'kosher',
    label: 'Kosher',
    icon: Star,
    activeClasses: 'border-blue-400 bg-blue-50 dark:bg-blue-950/30',
    iconColor: 'text-blue-600',
  },
  {
    key: 'halal',
    label: 'Halal',
    icon: Moon,
    activeClasses: 'border-green-400 bg-green-50 dark:bg-green-950/30',
    iconColor: 'text-green-600',
  },
  {
    key: 'vegetarian',
    label: 'Vegetarian',
    icon: Leaf,
    activeClasses: 'border-emerald-400 bg-emerald-50 dark:bg-emerald-950/30',
    iconColor: 'text-emerald-600',
  },
  {
    key: 'vegan',
    label: 'Vegan',
    icon: Sprout,
    activeClasses: 'border-teal-400 bg-teal-50 dark:bg-teal-950/30',
    iconColor: 'text-teal-600',
  },
] as const

function DietaryFields({
  data,
  u,
}: {
  data: Record<string, unknown>
  u: (p: string[], v: unknown) => void
}) {
  const dietary = (data.dietary as Record<string, boolean>) ?? {}

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {DIETARY_CONFIG.map((item) => {
        const isActive = dietary[item.key] ?? false
        return (
          <div
            key={item.key}
            className={cn(
              'flex flex-col items-center gap-2 rounded-lg border p-3 transition-all',
              isActive ? item.activeClasses : 'opacity-40',
            )}
          >
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
}: {
  g: (p: string[]) => string
  gn: (p: string[]) => string
  u: (p: string[], v: unknown) => void
}) {
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
        />
        <FieldNumber
          label="Max"
          value={gn(['storage', 'temperatureRange', 'max'])}
          onChange={(v) => u(['storage', 'temperatureRange', 'max'], v)}
        />
      </div>
      <div className="grid gap-2">
        <Label>Storage type</Label>
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
        />
        <FieldNumber
          label="Shelf life from delivery (days)"
          value={gn(['storage', 'shelfLifeFromDeliveryDays'])}
          onChange={(v) => u(['storage', 'shelfLifeFromDeliveryDays'], v)}
        />
      </div>
    </>
  )
}

// ─── Pricing ─────────────────────────────────────────────────────────────────

function PricingFields({
  gn,
  u,
}: {
  gn: (p: string[]) => string
  u: (p: string[], v: unknown) => void
}) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <FieldNumber
          label="Ex Works / kg"
          value={gn(['pricing', 'exWorksPerKg'])}
          onChange={(v) => u(['pricing', 'exWorksPerKg'], v)}
        />
        <FieldNumber
          label="Ex Works / unit"
          value={gn(['pricing', 'exWorksPerUnit'])}
          onChange={(v) => u(['pricing', 'exWorksPerUnit'], v)}
        />
        <FieldNumber
          label="Delivered / kg"
          value={gn(['pricing', 'deliveredPerKg'])}
          onChange={(v) => u(['pricing', 'deliveredPerKg'], v)}
        />
        <FieldNumber
          label="Delivered / unit"
          value={gn(['pricing', 'deliveredPerUnit'])}
          onChange={(v) => u(['pricing', 'deliveredPerUnit'], v)}
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
}: {
  g: (p: string[]) => string
  u: (p: string[], v: unknown) => void
  data: Record<string, unknown>
}) {
  const labelData = (data.label as Record<string, unknown>) ?? {}
  const labelImages = (labelData.labelImages as string[]) ?? []

  return (
    <>
      <div className="grid gap-2">
        <Label>Label images</Label>
        <ProductImageManager images={labelImages} disabled />
      </div>
      <div className="grid gap-2">
        <Label>Carton print</Label>
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
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
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
}: {
  label: string
  value: string
  onChange: (v: number | undefined) => void
}) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
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
