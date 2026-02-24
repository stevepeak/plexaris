'use i18n'
'use client'

import { useOrg } from '@/components/org-context'
import { SuggestionsTab } from '@/components/org-page/suggestions-tab'

export default function SuggestionsPage() {
  const { organizationId } = useOrg()

  return <SuggestionsTab organizationId={organizationId} />
}
