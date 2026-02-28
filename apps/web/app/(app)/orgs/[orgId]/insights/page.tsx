'use i18n'
'use client'

import { useOrg } from '@/components/org-context'
import { InsightsTab } from '@/components/org-page/insights-tab'

export default function InsightsPage() {
  const { organizationId } = useOrg()

  return <InsightsTab organizationId={organizationId} />
}
