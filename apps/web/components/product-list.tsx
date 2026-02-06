'use client'

import { Archive, ArchiveRestore, Package, Plus } from 'lucide-react'
import { useState } from 'react'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export type Product = {
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

function ProductTable({
  products,
  isOwner,
  isArchived,
  onEditProduct,
  onArchiveProduct,
  onRestoreProduct,
}: {
  products: Product[]
  isOwner: boolean
  isArchived: boolean
  onEditProduct?: (product: Product) => void
  onArchiveProduct?: (product: Product) => void
  onRestoreProduct?: (product: Product) => void
}) {
  const [archiveConfirm, setArchiveConfirm] = useState<Product | null>(null)

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Package className="h-12 w-12 text-muted-foreground/50" />
        <p className="mt-4 text-sm text-muted-foreground">
          {isArchived
            ? 'No archived products.'
            : isOwner
              ? 'Add your first product to get started.'
              : 'This supplier has no products yet.'}
        </p>
      </div>
    )
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Status</TableHead>
            {isOwner && <TableHead className="w-[80px]" />}
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow
              key={product.id}
              className={
                isOwner && onEditProduct && !isArchived
                  ? 'cursor-pointer'
                  : undefined
              }
              onClick={
                isOwner && onEditProduct && !isArchived
                  ? () => onEditProduct(product)
                  : undefined
              }
            >
              <TableCell className="font-medium">{product.name}</TableCell>
              <TableCell className="text-muted-foreground">
                {product.category ?? '-'}
              </TableCell>
              <TableCell>{formatPrice(product.price, product.unit)}</TableCell>
              <TableCell>
                <Badge variant={statusBadgeVariant(product.status)}>
                  {product.status}
                </Badge>
              </TableCell>
              {isOwner && (
                <TableCell>
                  {isArchived ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation()
                        onRestoreProduct?.(product)
                      }}
                      title="Restore product"
                    >
                      <ArchiveRestore className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation()
                        setArchiveConfirm(product)
                      }}
                      title="Archive product"
                    >
                      <Archive className="h-4 w-4" />
                    </Button>
                  )}
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <AlertDialog
        open={archiveConfirm !== null}
        onOpenChange={(open) => {
          if (!open) setArchiveConfirm(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to archive &ldquo;{archiveConfirm?.name}
              &rdquo;? Archived products won&apos;t be visible to customers. You
              can restore it later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (archiveConfirm) {
                  onArchiveProduct?.(archiveConfirm)
                  setArchiveConfirm(null)
                }
              }}
            >
              Archive
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export function ProductList({
  products,
  archivedProducts,
  isPending,
  isOwner,
  onAddProduct,
  onEditProduct,
  onArchiveProduct,
  onRestoreProduct,
}: {
  products: Product[]
  archivedProducts: Product[]
  isPending: boolean
  isOwner: boolean
  onAddProduct?: () => void
  onEditProduct?: (product: Product) => void
  onArchiveProduct?: (product: Product) => void
  onRestoreProduct?: (product: Product) => void
}) {
  if (isPending) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Products</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {products.length === 0
              ? 'No products yet'
              : `${products.length} product${products.length === 1 ? '' : 's'}`}
          </p>
        </div>
        {isOwner && (
          <Button size="sm" onClick={onAddProduct}>
            <Plus className="h-4 w-4" />
            Add Product
          </Button>
        )}
      </div>
      <Separator className="my-6" />
      {isOwner && archivedProducts.length > 0 ? (
        <Tabs defaultValue="active">
          <TabsList>
            <TabsTrigger value="active">Active ({products.length})</TabsTrigger>
            <TabsTrigger value="archived">
              Archived ({archivedProducts.length})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="active">
            <ProductTable
              products={products}
              isOwner={isOwner}
              isArchived={false}
              onEditProduct={onEditProduct}
              onArchiveProduct={onArchiveProduct}
            />
          </TabsContent>
          <TabsContent value="archived">
            <ProductTable
              products={archivedProducts}
              isOwner={isOwner}
              isArchived
              onRestoreProduct={onRestoreProduct}
            />
          </TabsContent>
        </Tabs>
      ) : (
        <ProductTable
          products={products}
          isOwner={isOwner}
          isArchived={false}
          onEditProduct={onEditProduct}
          onArchiveProduct={onArchiveProduct}
        />
      )}
    </div>
  )
}
