'use i18n'
'use client'

import {
  type Product,
  PRODUCT_SECTION_LABELS,
  type ProductSectionKey,
  productSectionKeys,
} from '@app/db/data-schemas'
import { ArrowLeft, Eye, History, Loader2, Pencil } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

import { CategoryPicker } from '@/components/category-picker'
import { ProductSections } from '@/components/order/product-detail'
import { ProductChangesPopover } from '@/components/product-changes-popover'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { cn } from '@/lib/utils'

import { FieldLabel } from './field-primitives'
import { SectionFields } from './section-fields'
import { type ProductFormProps, SECTION_ICONS } from './types'

export function ProductForm({
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

  const [viewMode, setViewMode] = useState<'edit' | 'preview'>(() => {
    if (typeof window === 'undefined') return 'edit'
    return new URLSearchParams(window.location.search).get('mode') === 'preview'
      ? 'preview'
      : 'edit'
  })

  useEffect(() => {
    const onPopState = () => {
      const mode = new URLSearchParams(window.location.search).get('mode')
      setViewMode(mode === 'preview' ? 'preview' : 'edit')
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showDiscardWarning, setShowDiscardWarning] = useState(false)
  const discardTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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

  const handleBack = useCallback(() => {
    // Preview mode → back to edit
    if (viewMode === 'preview') {
      window.history.back()
      return
    }
    // Edit mode with changes → warn first, second click discards
    if (changeCount > 0 && !showDiscardWarning) {
      setShowDiscardWarning(true)
      if (discardTimerRef.current) clearTimeout(discardTimerRef.current)
      discardTimerRef.current = setTimeout(
        () => setShowDiscardWarning(false),
        3000,
      )
      return
    }
    // Edit mode with no changes, or already warned → navigate away
    setShowDiscardWarning(false)
    onCancel?.()
  }, [viewMode, changeCount, showDiscardWarning, onCancel])

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
      setOpenSections((prev) => prev.filter((k) => k !== key))
    } else {
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
          <div className="flex flex-col items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              type="button"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            {showDiscardWarning && (
              <span className="text-[10px] text-destructive">
                Click to discard
              </span>
            )}
          </div>
        )}
        <div className="flex-1">
          <h2 className="text-lg font-semibold">
            {isEditing ? <span>Edit product</span> : <span>Add product</span>}
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
              <CategoryPicker value={category} onValueChange={setCategory} />
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
                          {enabled ? (
                            <span>Disable section</span>
                          ) : (
                            <span>Enable section</span>
                          )}
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
              onClick={() => {
                if (viewMode === 'edit') {
                  const url = new URL(window.location.href)
                  url.searchParams.set('mode', 'preview')
                  window.history.pushState(null, '', url.toString())
                  setViewMode('preview')
                } else {
                  window.history.back()
                }
              }}
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
