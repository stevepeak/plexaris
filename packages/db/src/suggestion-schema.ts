import {
  index,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core'

import { user } from './auth-schema'
import { organization } from './org-schema'
import { triggerRun } from './trigger-run-schema'

export const suggestionTargetTypeEnum = pgEnum('suggestion_target_type', [
  'product',
  'organization',
])

export const suggestionActionEnum = pgEnum('suggestion_action', [
  'create',
  'update',
  'update_field',
])

export const suggestionStatusEnum = pgEnum('suggestion_status', [
  'pending',
  'accepted',
  'rejected',
  'dismissed',
])

export const suggestion = pgTable(
  'suggestion',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organization.id),
    targetType: suggestionTargetTypeEnum('target_type').notNull(),
    targetId: uuid('target_id'),
    action: suggestionActionEnum('action').notNull(),
    field: text('field'),
    label: text('label').notNull(),
    currentValue: jsonb('current_value'),
    proposedValue: jsonb('proposed_value').notNull(),
    confidence: text('confidence'),
    source: text('source'),
    reasoning: text('reasoning'),
    triggerRunId: text('trigger_run_id')
      .notNull()
      .references(() => triggerRun.triggerRunId),
    status: suggestionStatusEnum('status').notNull().default('pending'),
    reviewedBy: text('reviewed_by').references(() => user.id),
    reviewedAt: timestamp('reviewed_at', { withTimezone: true, mode: 'date' }),
    createdAt: timestamp('created_at', {
      withTimezone: true,
      mode: 'date',
    }).notNull(),
    updatedAt: timestamp('updated_at', {
      withTimezone: true,
      mode: 'date',
    }).notNull(),
  },
  (table) => [
    index('suggestion_org_id_idx').on(table.organizationId),
    index('suggestion_target_id_idx').on(table.targetId),
  ],
)
