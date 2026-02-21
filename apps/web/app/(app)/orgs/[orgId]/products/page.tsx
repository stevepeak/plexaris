'use client'

import { useOrg } from '@/components/org-context'
import { ProductsTab } from '@/components/org-page/products-tab'

export default function ProductsPage() {
  const { organizationId, permissions } = useOrg()

  return (
    <ProductsTab organizationId={organizationId} permissions={permissions} />
  )
}
