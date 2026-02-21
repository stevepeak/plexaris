'use client'

import { useOrg } from '@/components/org-context'
import { McpTab } from '@/components/org-page/mcp-tab'

export default function McpPage() {
  const { organizationId } = useOrg()

  return <McpTab organizationId={organizationId} />
}
