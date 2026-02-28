'use i18n'
'use client'

import { useOrg } from '@/components/org-context'
import { IntegrationsTab } from '@/components/org-page/integrations-tab'

export default function IntegrationsPage() {
  const { organizationId } = useOrg()

  return <IntegrationsTab organizationId={organizationId} />
}
