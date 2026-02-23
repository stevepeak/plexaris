import { integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

import { organization } from './org-schema'

export const file = pgTable('file', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id')
    .notNull()
    .references(() => organization.id),
  name: text('name').notNull(),
  mimeType: text('mime_type').notNull(),
  size: integer('size').notNull(),
  url: text('url').notNull(),
  key: text('key').notNull(),
  createdAt: timestamp('created_at', {
    withTimezone: true,
    mode: 'date',
  }).notNull(),
})
