'use client'

import { useOrg } from '@/components/org-context'
import { NotificationsTab } from '@/components/org-page/notifications-tab'

export default function NotificationsPage() {
  const { organizationId } = useOrg()

  return <NotificationsTab organizationId={organizationId} />
}
