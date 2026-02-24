'use i18n'
'use client'

import {
  PRODUCT_SECTION_LABELS,
  type ProductSectionKey,
  productSectionKeys,
} from '@app/db/data-schemas'
import { Package, ShoppingCart, Star, Store } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { getCategoryIcon } from '@/lib/product-categories'

interface ProductData {
  id: string
  name: string
  description: string | null
  price: string | null
  unit: string | null
  category: string | null
  status: string
  images: string[]
  data?: Record<string, unknown> | null
  supplier: { id: string; name: string }
}

interface ProductDetailProps {
  productId: string
  onOpenSupplier: (supplierId: string, supplierName: string) => void
  onAddToCart?: (item: {
    id: string
    name: string
    price: number
    unit: string
    supplierId: string
    supplierName: string
    category: string | null
  }) => void
  organizationId?: string | null
  onFavoriteToggled?: () => void
}

export function ProductDetail({
  productId,
  onOpenSupplier,
  onAddToCart,
  organizationId,
  onFavoriteToggled,
}: ProductDetailProps) {
  const [product, setProduct] = useState<ProductData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFavorited, setIsFavorited] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setIsLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/products/${productId}`)
        if (!res.ok) {
          setError('Product not found')
          return
        }
        const data = await res.json()
        if (!cancelled) {
          setProduct(data.product)
        }
      } catch {
        if (!cancelled) {
          setError('Failed to load product')
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [productId])

  // Check favorite status when product and org are available
  useEffect(() => {
    if (!organizationId || !productId) return
    let cancelled = false

    async function checkFavorite() {
      const params = new URLSearchParams({
        organizationId: organizationId!,
        targetType: 'product',
      })
      const res = await fetch(`/api/favorites?${params.toString()}`)
      if (res.ok && !cancelled) {
        const data = await res.json()
        const ids = new Set(
          (data.favorites as { id: string }[]).map((f) => f.id),
        )
        setIsFavorited(ids.has(productId))
      }
    }

    void checkFavorite()
    return () => {
      cancelled = true
    }
  }, [organizationId, productId])

  const toggleFavorite = useCallback(async () => {
    if (!organizationId) return
    const prev = isFavorited
    setIsFavorited(!prev)
    try {
      const res = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId,
          targetType: 'product',
          targetId: productId,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        setIsFavorited(data.favorited)
        onFavoriteToggled?.()
      } else {
        setIsFavorited(prev)
      }
    } catch {
      setIsFavorited(prev)
    }
  }, [organizationId, productId, isFavorited, onFavoriteToggled])

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 p-6">
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-20 w-full" />
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <p className="text-sm text-muted-foreground">{error ?? 'Not found'}</p>
      </div>
    )
  }

  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col gap-6 p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted">
            <Package className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="flex flex-col gap-1">
            {product.category && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                {(() => {
                  const Icon = getCategoryIcon(product.category)
                  return Icon ? <Icon className="h-3 w-3" /> : null
                })()}
                {product.category}
              </span>
            )}
            <h2 className="text-lg font-semibold">{product.name}</h2>
          </div>
          {organizationId && (
            <button
              type="button"
              className="ml-auto shrink-0"
              onClick={toggleFavorite}
            >
              <Star
                className={`h-5 w-5 ${isFavorited ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground'}`}
              />
            </button>
          )}
        </div>

        {product.description && (
          <p className="text-sm text-muted-foreground">{product.description}</p>
        )}

        <div className="flex flex-col gap-2">
          {product.price != null && (
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-semibold">{product.price}</span>
              {product.unit && (
                <span className="text-sm text-muted-foreground">
                  / {product.unit}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium uppercase text-muted-foreground">
            Supplier
          </span>
          <Button
            variant="outline"
            className="justify-start gap-2"
            onClick={() =>
              onOpenSupplier(product.supplier.id, product.supplier.name)
            }
          >
            <Store className="h-4 w-4" />
            {product.supplier.name}
          </Button>
        </div>

        {onAddToCart && (
          <Button
            className="gap-2"
            onClick={() =>
              onAddToCart({
                id: product.id,
                name: product.name,
                price: parseFloat(
                  product.price?.replace(/[^0-9.]/g, '') ?? '0',
                ),
                unit: product.unit ?? 'each',
                supplierId: product.supplier.id,
                supplierName: product.supplier.name,
                category: product.category,
              })
            }
          >
            <ShoppingCart className="h-4 w-4" />
            Add to Cart
          </Button>
        )}

        <ProductSections data={product.data} />
      </div>
    </ScrollArea>
  )
}

// ─── Product Section Display ─────────────────────────────────────────────────

export function ProductSections({
  data,
}: {
  data?: Record<string, unknown> | null
}) {
  if (!data) return null

  const sections = (data.sections ?? {}) as Record<string, boolean>
  const visibleKeys = productSectionKeys.filter((key) => {
    // Show section if explicitly enabled, or if sections config is missing (backwards compat)
    if (Object.keys(sections).length === 0) {
      return data[key] != null
    }
    return sections[key] !== false && data[key] != null
  })

  if (visibleKeys.length === 0) return null

  return (
    <>
      <Separator />
      <Accordion type="multiple" defaultValue={visibleKeys} className="w-full">
        {visibleKeys.map((key) => (
          <AccordionItem key={key} value={key}>
            <AccordionTrigger>{PRODUCT_SECTION_LABELS[key]}</AccordionTrigger>
            <AccordionContent>
              <SectionDisplay
                sectionKey={key}
                data={data[key] as Record<string, unknown>}
              />
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </>
  )
}

function SectionDisplay({
  sectionKey,
  data,
}: {
  sectionKey: ProductSectionKey
  data: Record<string, unknown>
}) {
  if (!data) return null

  switch (sectionKey) {
    case 'general':
      return <GeneralDisplay data={data} />
    case 'photos':
      return <PhotosDisplay data={data} />
    case 'unit':
    case 'case':
      return <PackagingDisplay data={data} sectionKey={sectionKey} />
    case 'pallet':
      return <PalletDisplay data={data} />
    case 'ingredients':
      return <IngredientsDisplay data={data} />
    case 'nutrition':
      return <NutritionDisplay data={data} />
    case 'allergens':
      return <AllergensDisplay data={data} />
    case 'dietary':
      return <DietaryDisplay data={data} />
    case 'storage':
      return <StorageDisplay data={data} />
    case 'pricing':
      return <PricingDisplay data={data} />
    case 'label':
      return <LabelDisplay data={data} />
    default:
      return null
  }
}

function DataRow({ label, value }: { label: string; value: unknown }) {
  if (value == null || value === '') return null
  return (
    <div className="flex justify-between gap-4 py-1">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{String(value)}</span>
    </div>
  )
}

function SubHeader({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-2 mb-1 text-xs font-medium text-muted-foreground">
      {children}
    </p>
  )
}

function GeneralDisplay({ data }: { data: Record<string, unknown> }) {
  return (
    <div className="flex flex-col">
      <DataRow label="Brand" value={data.brand} />
      <DataRow label="Variant" value={data.variant} />
      <DataRow label="Description" value={data.description} />
      <DataRow label="Article number" value={data.articleNumber} />
      <DataRow label="Intrastat code" value={data.intrastatCode} />
      <DataRow label="Country of origin" value={data.countryOfOrigin} />
    </div>
  )
}

function PhotosDisplay({ data }: { data: Record<string, unknown> }) {
  const images = (data.images as string[]) ?? []
  if (images.length === 0) {
    return <p className="text-sm text-muted-foreground">No images</p>
  }
  return (
    <div className="flex flex-wrap gap-2">
      {images.map((url, i) => (
        <img
          key={i}
          src={url}
          alt={`Product ${i + 1}`}
          className="h-20 w-20 rounded-md border object-cover"
        />
      ))}
    </div>
  )
}

function PackagingDisplay({
  data,
  sectionKey,
}: {
  data: Record<string, unknown>
  sectionKey: string
}) {
  const dims = data.dimensions as Record<string, unknown> | undefined
  const weight = data.weight as Record<string, unknown> | undefined
  const nc = data.netContent as Record<string, unknown> | undefined
  return (
    <div className="flex flex-col">
      <DataRow label="GTIN" value={data.gtin} />
      {dims && (
        <>
          <SubHeader>Dimensions (mm)</SubHeader>
          <DataRow label="Height" value={dims.height} />
          <DataRow label="Width" value={dims.width} />
          <DataRow label="Depth" value={dims.depth} />
        </>
      )}
      {weight && (
        <>
          <SubHeader>Weight (grams)</SubHeader>
          <DataRow label="Gross" value={weight.gross} />
          <DataRow label="Net" value={weight.net} />
        </>
      )}
      {nc && (
        <>
          <SubHeader>Net content</SubHeader>
          <DataRow label="Milliliters" value={nc.milliliters} />
          <DataRow label="Grams" value={nc.grams} />
        </>
      )}
      {sectionKey === 'case' && (
        <DataRow label="Units per case" value={data.unitsPerCase} />
      )}
      <DataRow label="Packaging type" value={data.packagingType} />
    </div>
  )
}

function PalletDisplay({ data }: { data: Record<string, unknown> }) {
  const load = data.load as Record<string, unknown> | undefined
  const dims = data.dimensions as Record<string, unknown> | undefined
  const weight = data.weight as Record<string, unknown> | undefined
  return (
    <div className="flex flex-col">
      <DataRow label="GTIN" value={data.gtin} />
      <DataRow label="Pallet type" value={data.palletType} />
      {load && (
        <>
          <SubHeader>Load configuration</SubHeader>
          <DataRow label="Layers / pallet" value={load.layersPerPallet} />
          <DataRow label="Cases / layer" value={load.casesPerLayer} />
          <DataRow label="Cases / pallet" value={load.casesPerPallet} />
        </>
      )}
      {dims && (
        <>
          <SubHeader>Dimensions (cm)</SubHeader>
          <DataRow
            label="Height (with product)"
            value={dims.heightWithProduct}
          />
          <DataRow
            label="Height (without product)"
            value={dims.heightWithoutProduct}
          />
          <DataRow label="Width" value={dims.width} />
          <DataRow label="Depth" value={dims.depth} />
        </>
      )}
      {weight && (
        <>
          <SubHeader>Weight (kg)</SubHeader>
          <DataRow label="Gross" value={weight.gross} />
          <DataRow label="Net" value={weight.net} />
        </>
      )}
    </div>
  )
}

function IngredientsDisplay({ data }: { data: Record<string, unknown> }) {
  const palmOil = data.palmOil as Record<string, unknown> | undefined
  return (
    <div className="flex flex-col gap-2">
      {typeof data.ingredients === 'string' && (
        <p className="text-sm whitespace-pre-wrap">{data.ingredients}</p>
      )}
      <DataRow label="Warning statements" value={data.warningStatements} />
      {palmOil && (
        <>
          <SubHeader>Palm oil</SubHeader>
          <DataRow label="Origin" value={palmOil.origin} />
          <DataRow label="Amount (%)" value={palmOil.amountPercent} />
          <DataRow label="RSPO certificate" value={palmOil.rspoCertificate} />
        </>
      )}
    </div>
  )
}

function NutritionDisplay({ data }: { data: Record<string, unknown> }) {
  const fields = [
    ['energyKj', 'Energy (kJ)'],
    ['energyKcal', 'Energy (kcal)'],
    ['fatG', 'Fat (g)'],
    ['saturatedFatG', 'Saturated fat (g)'],
    ['carbohydratesG', 'Carbohydrates (g)'],
    ['sugarsG', 'Sugars (g)'],
    ['proteinG', 'Protein (g)'],
    ['saltG', 'Salt (g)'],
    ['fiberG', 'Fiber (g)'],
  ] as const
  return (
    <div className="flex flex-col">
      <p className="mb-1 text-xs text-muted-foreground">Per 100g / 100ml</p>
      {fields.map(([key, label]) => (
        <DataRow key={key} label={label} value={data[key]} />
      ))}
    </div>
  )
}

function AllergensDisplay({ data }: { data: Record<string, unknown> }) {
  const allergens = (data.allergens as Record<string, string>) ?? {}
  const entries = Object.entries(allergens)
  if (entries.length === 0) {
    return <p className="text-sm text-muted-foreground">No allergen data</p>
  }
  return (
    <div className="flex flex-wrap gap-2">
      {entries.map(([name, status]) => (
        <Badge
          key={name}
          variant={
            status === 'contains'
              ? 'destructive'
              : status === 'may_contain'
                ? 'secondary'
                : 'outline'
          }
        >
          {name}: {status.replace(/_/g, ' ')}
        </Badge>
      ))}
    </div>
  )
}

function DietaryDisplay({ data }: { data: Record<string, unknown> }) {
  const flags = ['kosher', 'halal', 'vegetarian', 'vegan'] as const
  return (
    <div className="flex flex-wrap gap-2">
      {flags.map((flag) =>
        data[flag] != null ? (
          <Badge key={flag} variant={data[flag] ? 'default' : 'outline'}>
            {flag}: {data[flag] ? <span>Yes</span> : <span>No</span>}
          </Badge>
        ) : null,
      )}
    </div>
  )
}

function StorageDisplay({ data }: { data: Record<string, unknown> }) {
  const temp = data.temperatureRange as Record<string, unknown> | undefined
  return (
    <div className="flex flex-col">
      <DataRow label="Storage type" value={data.storageType} />
      {temp && (
        <>
          <SubHeader>Temperature range (°C)</SubHeader>
          <DataRow label="Min" value={temp.min} />
          <DataRow label="Max" value={temp.max} />
        </>
      )}
      <DataRow
        label="Shelf life (production)"
        value={
          data.shelfLifeFromProductionDays
            ? `${data.shelfLifeFromProductionDays} days`
            : null
        }
      />
      <DataRow
        label="Shelf life (delivery)"
        value={
          data.shelfLifeFromDeliveryDays
            ? `${data.shelfLifeFromDeliveryDays} days`
            : null
        }
      />
    </div>
  )
}

function PricingDisplay({ data }: { data: Record<string, unknown> }) {
  return (
    <div className="flex flex-col">
      <DataRow label="Currency" value={data.currency} />
      <DataRow label="Ex Works / kg" value={data.exWorksPerKg} />
      <DataRow label="Ex Works / unit" value={data.exWorksPerUnit} />
      <DataRow label="Delivered / kg" value={data.deliveredPerKg} />
      <DataRow label="Delivered / unit" value={data.deliveredPerUnit} />
    </div>
  )
}

function LabelDisplay({ data }: { data: Record<string, unknown> }) {
  const labelImages = (data.labelImages as string[]) ?? []
  return (
    <div className="flex flex-col gap-2">
      {labelImages.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {labelImages.map((url, i) => (
            <img
              key={i}
              src={url}
              alt={`Label ${i + 1}`}
              className="h-20 w-20 rounded-md border object-cover"
            />
          ))}
        </div>
      )}
      <DataRow label="Carton print" value={data.cartonPrint} />
    </div>
  )
}
