'use client'

import { useOrg } from '@/components/org-context'
import { SettingsTab } from '@/components/org-page/settings-tab'

export default function SettingsPage() {
  const { organizationId } = useOrg()

  return <SettingsTab organizationId={organizationId} />
}
