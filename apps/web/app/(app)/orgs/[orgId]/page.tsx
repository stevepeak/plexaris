'use i18n'
'use client'

import { useOrg } from '@/components/org-context'
import { DashboardTab } from '@/components/org-page/dashboard-tab'

export default function OrgDashboardPage() {
  const { organizationId, orgName, orgType, refreshOrg } = useOrg()

  return (
    <DashboardTab
      key={organizationId}
      organizationId={organizationId}
      orgName={orgName}
      orgType={orgType}
      onInvitationAccepted={refreshOrg}
    />
  )
}
