'use client'

import { useOrg } from '@/components/org-context'
import { OrdersTab } from '@/components/org-page/orders-tab'

export default function OrdersPage() {
  const { organizationId, orgType } = useOrg()

  return <OrdersTab organizationId={organizationId} orgType={orgType} />
}
