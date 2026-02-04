import {
  boolean,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from 'drizzle-orm/pg-core'

import { user } from './auth-schema'
import { organization } from './org-schema'

export const notificationTypeEnum = pgEnum('notification_type', [
  'order_placed',
  'order_cancelled',
  'order_returned',
  'user_invited',
  'user_accepted_invite',
  'order_issues',
])

export const notificationPreference = pgTable(
  'notification_preference',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organization.id),
    notificationType: notificationTypeEnum('notification_type').notNull(),
    email: boolean('email').notNull().default(true),
    sms: boolean('sms').notNull().default(true),
    inApp: boolean('in_app').notNull().default(true),
    createdAt: timestamp('created_at').notNull(),
    updatedAt: timestamp('updated_at').notNull(),
  },
  (table) => [
    unique().on(table.userId, table.organizationId, table.notificationType),
  ],
)
