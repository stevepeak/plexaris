import {
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from 'drizzle-orm/pg-core'

import { organization } from './org-schema'

export const scheduleTypeEnum = pgEnum('schedule_type', [
  'org_information_update',
  'product_updating',
  'competitive_analysis',
  'reduce_cost_analysis',
])

export const scheduleFrequencyEnum = pgEnum('schedule_frequency', [
  'daily',
  'weekly',
  'biweekly',
  'monthly',
])

export const agentSchedule = pgTable(
  'agent_schedule',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organization.id),
    name: text('name'),
    scheduleType: scheduleTypeEnum('schedule_type').notNull(),
    frequency: scheduleFrequencyEnum('frequency').notNull(),
    cron: text('cron').notNull(),
    urls: text('urls').array().notNull().default([]),
    triggerScheduleId: text('trigger_schedule_id'),
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
    unique().on(table.organizationId, table.scheduleType),
    index('agent_schedule_org_id_idx').on(table.organizationId),
  ],
)
