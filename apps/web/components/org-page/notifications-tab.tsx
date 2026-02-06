'use client'

import { NotificationSettings } from '@/components/notification-settings'

export function NotificationsTab({
  organizationId,
}: {
  organizationId: string
}) {
  return <NotificationSettings organizationId={organizationId} />
}
