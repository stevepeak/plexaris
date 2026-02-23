import { type DB, schema } from '@app/db'
import { capturePostHogEvent } from '@app/posthog'

type AuditAction =
  | 'order.created'
  | 'order.item_added'
  | 'order.item_removed'
  | 'order.archived'
  | 'order.duplicated'
  | 'suggestion.accepted'
  | 'suggestion.dismissed'
  | 'suggestion.reverted'
  | 'agent_schedule.created'
  | 'agent_schedule.deleted'
  | 'agent_schedule.run_now'
  | 'organization.updated'
  | 'role.created'
  | 'role.updated'
  | 'role.deleted'
  | 'member.role_changed'
  | 'member.invited'

type AuditEntityType =
  | 'order'
  | 'suggestion'
  | 'agent_schedule'
  | 'organization'
  | 'role'
  | 'membership'
  | 'invitation'

export function trackEvent(
  db: DB,
  params: {
    organizationId: string
    actorId: string
    action: AuditAction
    entityType: AuditEntityType
    entityId?: string | null
    payload?: Record<string, unknown>
  },
) {
  // eslint-disable-next-line no-console
  console.log('[event]', params.action, {
    organizationId: params.organizationId,
    entityType: params.entityType,
    entityId: params.entityId ?? null,
  })

  capturePostHogEvent(
    params.action,
    {
      organizationId: params.organizationId,
      entityType: params.entityType,
      entityId: params.entityId ?? null,
      ...params.payload,
    },
    params.actorId,
  )

  return db.insert(schema.auditLog).values({
    organizationId: params.organizationId,
    actorId: params.actorId,
    action: params.action,
    entityType: params.entityType,
    entityId: params.entityId ?? null,
    payload: params.payload ?? {},
    createdAt: new Date(),
  })
}
