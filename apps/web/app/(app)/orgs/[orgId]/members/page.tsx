'use i18n'
'use client'

import { useOrg } from '@/components/org-context'
import { MembersTab } from '@/components/org-page/members-tab'

export default function MembersPage() {
  const { organizationId, permissions, isAdmin } = useOrg()

  return (
    <MembersTab
      organizationId={organizationId}
      permissions={permissions}
      isAdmin={isAdmin}
    />
  )
}
