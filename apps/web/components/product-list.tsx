'use client'

import { Package, Plus } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

type Product = {
  id: string
  name: string
  description: string | null
  price: string | null
  unit: string | null
  category: string | null
  status: string
  images: string[]
  createdAt: string
  updatedAt: string
  archivedAt: string | null
}

function statusBadgeVariant(status: string) {
  switch (status) {
    case 'active':
      return 'default' as const
    case 'draft':
      return 'secondary' as const
    case 'archived':
      return 'outline' as const
    default:
      return 'secondary' as const
  }
}

function formatPrice(price: string | null, unit: string | null) {
  if (price == null) return '-'
  const formatted = new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
  }).format(Number(price))
  if (unit) return `${formatted} / ${unit}`
  return formatted
}

export function ProductList({
  products,
  isPending,
  isOwner,
  onAddProduct,
}: {
  products: Product[]
  isPending: boolean
  isOwner: boolean
  onAddProduct?: () => void
}) {
  if (isPending) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Products</CardTitle>
            <CardDescription>
              {products.length === 0
                ? 'No products yet'
                : `${products.length} product${products.length === 1 ? '' : 's'}`}
            </CardDescription>
          </div>
          {isOwner && (
            <Button size="sm" onClick={onAddProduct}>
              <Plus className="h-4 w-4" />
              Add Product
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Package className="h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4 text-sm text-muted-foreground">
              {isOwner
                ? 'Add your first product to get started.'
                : 'This supplier has no products yet.'}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {product.category ?? '-'}
                  </TableCell>
                  <TableCell>
                    {formatPrice(product.price, product.unit)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusBadgeVariant(product.status)}>
                      {product.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
