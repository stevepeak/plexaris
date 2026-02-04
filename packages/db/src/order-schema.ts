import {
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core'

import { user } from './auth-schema'
import { organization } from './org-schema'
import { product } from './product-schema'

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

export const orderStatusEnum = pgEnum('order_status', [
  'draft',
  'submitted',
  'confirmed',
  'delivered',
  'cancelled',
])

export const orderEventTypeEnum = pgEnum('order_event_type', [
  'order_created',
  'item_added',
  'item_removed',
  'item_quantity_changed',
  'item_supplier_changed',
  'order_submitted',
  'order_confirmed',
  'order_cancelled',
  'note_updated',
])

// ---------------------------------------------------------------------------
// Tables
// ---------------------------------------------------------------------------

export const order = pgTable('order', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id')
    .notNull()
    .references(() => organization.id),
  createdBy: text('created_by')
    .notNull()
    .references(() => user.id),
  status: orderStatusEnum('status').notNull().default('draft'),
  notes: text('notes'),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
  submittedAt: timestamp('submitted_at'),
  archivedAt: timestamp('archived_at'),
})

export const orderItem = pgTable('order_item', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id')
    .notNull()
    .references(() => order.id),
  productId: uuid('product_id')
    .notNull()
    .references(() => product.id),
  supplierId: uuid('supplier_id')
    .notNull()
    .references(() => organization.id),
  quantity: integer('quantity').notNull().default(1),
  unitPrice: numeric('unit_price', { precision: 10, scale: 2 }).notNull(),
  unit: text('unit'),
  addedBy: text('added_by')
    .notNull()
    .references(() => user.id),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
  removedAt: timestamp('removed_at'),
})

export const orderEvent = pgTable('order_event', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id')
    .notNull()
    .references(() => order.id),
  type: orderEventTypeEnum('type').notNull(),
  actorId: text('actor_id')
    .notNull()
    .references(() => user.id),
  payload: jsonb('payload').$type<Record<string, unknown>>().default({}),
  createdAt: timestamp('created_at').notNull(),
})
