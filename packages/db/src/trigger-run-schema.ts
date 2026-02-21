import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

import { user } from './auth-schema'
import { organization } from './org-schema'

export const triggerRun = pgTable('trigger_run', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id')
    .notNull()
    .references(() => organization.id),
  triggerRunId: text('trigger_run_id').notNull().unique(),
  taskType: text('task_type').notNull(),
  label: text('label').notNull(),
  status: text('status').notNull().default('running'),
  createdBy: text('created_by').references(() => user.id),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
})
