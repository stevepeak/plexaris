'use i18n'
'use client'

import { useRouter } from 'next/navigation'

import { ProductList } from '@/components/product-list'
import { trpc } from '@/lib/trpc'

export function ProductsTab({
  organizationId,
  permissions,
}: {
  organizationId: string
  permissions: string[]
}) {
  const router = useRouter()
  const { data, isPending } = trpc.product.list.useQuery({ organizationId })

  return (
    <ProductList
      products={(data ?? []).map((p) => ({
        ...p,
        images: p.images ?? [],
        data: p.data as Record<string, unknown> | null | undefined,
      }))}
      isPending={isPending}
      permissions={permissions}
      onAddProduct={() => router.push(`/orgs/${organizationId}/products/new`)}
      onEditProduct={(p) =>
        router.push(`/orgs/${organizationId}/products/${p.id}`)
      }
    />
  )
}
