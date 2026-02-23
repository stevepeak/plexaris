import {
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core'

import { user } from './auth-schema'
import { organization } from './org-schema'

export const product = pgTable(
  'product',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organization.id),
    currentVersionId: uuid('current_version_id'),
    name: text('name').notNull(),
    description: text('description'),
    price: numeric('price', { precision: 10, scale: 2 }),
    unit: text('unit'), // e.g. 'kg', 'piece', 'liter', 'box'
    category: text('category'),
    status: text('status').notNull().default('draft'), // 'draft', 'active', 'archived'
    images: jsonb('images').$type<string[]>().default([]),
    data: jsonb('data'),
    createdAt: timestamp('created_at', {
      withTimezone: true,
      mode: 'date',
    }).notNull(),
    updatedAt: timestamp('updated_at', {
      withTimezone: true,
      mode: 'date',
    }).notNull(),
    archivedAt: timestamp('archived_at', { withTimezone: true, mode: 'date' }),
  },
  (table) => [index('product_organization_id_idx').on(table.organizationId)],
)

export const productVersion = pgTable('product_version', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id')
    .notNull()
    .references(() => product.id),
  version: integer('version').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  price: numeric('price', { precision: 10, scale: 2 }),
  unit: text('unit'),
  category: text('category'),
  images: jsonb('images').$type<string[]>().default([]),
  data: jsonb('data'),
  editedBy: text('edited_by')
    .notNull()
    .references(() => user.id),
  note: text('note'),
  createdAt: timestamp('created_at', {
    withTimezone: true,
    mode: 'date',
  }).notNull(),
})
