'use i18n'
'use client'

import { useRouter } from 'next/navigation'
import { useCallback } from 'react'

import { useOrg } from '@/components/org-context'
import { DangerZoneTab } from '@/components/org-page/danger-zone-tab'

export default function DangerZonePage() {
  const router = useRouter()
  const { organizationId } = useOrg()

  const handleOrgLeft = useCallback(() => {
    localStorage.removeItem('plexaris:activeOrgId')
    router.push('/dashboard')
  }, [router])

  const handleOrgArchived = useCallback(() => {
    localStorage.removeItem('plexaris:activeOrgId')
    router.push('/dashboard')
  }, [router])

  return (
    <DangerZoneTab
      organizationId={organizationId}
      onOrgLeft={handleOrgLeft}
      onOrgArchived={handleOrgArchived}
    />
  )
}
