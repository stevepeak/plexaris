'use client'

import { useOrg } from '@/components/org-context'
import { RolesTab } from '@/components/org-page/roles-tab'

export default function RolesPage() {
  const { organizationId, permissions, isAdmin } = useOrg()

  return (
    <RolesTab
      organizationId={organizationId}
      permissions={permissions}
      isAdmin={isAdmin}
    />
  )
}
