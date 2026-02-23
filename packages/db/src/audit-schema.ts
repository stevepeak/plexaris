import {
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core'

import { user } from './auth-schema'
import { organization } from './org-schema'

export const auditLog = pgTable(
  'audit_log',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organization.id),
    actorId: text('actor_id')
      .notNull()
      .references(() => user.id),
    action: text('action').notNull(),
    entityType: text('entity_type').notNull(),
    entityId: text('entity_id'),
    payload: jsonb('payload').$type<Record<string, unknown>>().default({}),
    createdAt: timestamp('created_at', {
      withTimezone: true,
      mode: 'date',
    }).notNull(),
  },
  (table) => [
    index('audit_log_org_created_idx').on(
      table.organizationId,
      table.createdAt,
    ),
    index('audit_log_actor_id_idx').on(table.actorId),
    index('audit_log_org_entity_idx').on(table.organizationId, table.entityId),
  ],
)
