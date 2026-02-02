import { jsonb, numeric, pgTable, text, timestamp } from 'drizzle-orm/pg-core'

import { organization } from './org-schema'

export const product = pgTable('product', {
  id: text('id').primaryKey(),
  organizationId: text('organization_id')
    .notNull()
    .references(() => organization.id),
  name: text('name').notNull(),
  description: text('description'),
  price: numeric('price', { precision: 10, scale: 2 }),
  unit: text('unit'), // e.g. 'kg', 'piece', 'liter', 'box'
  category: text('category'),
  status: text('status').notNull().default('draft'), // 'draft', 'active', 'archived'
  images: jsonb('images').$type<string[]>().default([]),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
  archivedAt: timestamp('archived_at'),
})
