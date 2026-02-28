'use i18n'
'use client'

import { useOrg } from '@/components/org-context'
import { AlignTab } from '@/components/org-page/align-tab'

export default function AlignPage() {
  const { organizationId } = useOrg()

  return <AlignTab organizationId={organizationId} />
}
