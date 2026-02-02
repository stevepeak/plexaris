'use client'

import { ArrowLeft, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
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
import { Textarea } from '@/components/ui/textarea'

const UNITS = ['piece', 'kg', 'liter', 'box', 'bag', 'bunch'] as const
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

type ProductFormData = {
  name: string
  description: string
  price: string
  unit: string
  category: string
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
  } | null
  onSubmit?: (data: ProductFormData) => Promise<{ error?: string }>
  onCancel?: () => void
  isPending?: boolean
}

export function ProductForm({
  product,
  onSubmit,
  onCancel,
  isPending,
}: ProductFormProps) {
  const isEditing = !!product

  const [name, setName] = useState(product?.name ?? '')
  const [description, setDescription] = useState(product?.description ?? '')
  const [price, setPrice] = useState(product?.price ?? '')
  const [unit, setUnit] = useState(product?.unit ?? '')
  const [category, setCategory] = useState(product?.category ?? '')

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (product) {
      setName(product.name)
      setDescription(product.description ?? '')
      setPrice(product.price ?? '')
      setUnit(product.unit ?? '')
      setCategory(product.category ?? '')
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!onSubmit) return
    setIsLoading(true)
    setError(null)

    const result = await onSubmit({
      name,
      description,
      price,
      unit,
      category,
    })

    if (result.error) {
      setError(result.error)
    }
    setIsLoading(false)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          {onCancel && (
            <Button variant="ghost" size="icon" onClick={onCancel}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <div>
            <CardTitle>{isEditing ? 'Edit product' : 'Add product'}</CardTitle>
            <CardDescription>
              {isEditing
                ? 'Update your product details'
                : 'Add a new product to your catalog'}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="grid gap-4">
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
            <Label htmlFor="product-description">Description</Label>
            <Textarea
              id="product-description"
              placeholder="Describe your product..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="product-price">Price (EUR)</Label>
              <Input
                id="product-price"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="product-unit">Unit</Label>
              <Select value={unit} onValueChange={setUnit}>
                <SelectTrigger id="product-unit">
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  {UNITS.map((u) => (
                    <SelectItem key={u} value={u}>
                      {u}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
      </CardContent>
    </Card>
  )
}
