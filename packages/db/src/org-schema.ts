import { pgTable, text, timestamp, unique } from 'drizzle-orm/pg-core'

import { user } from './auth-schema'

export const organization = pgTable('organization', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  type: text('type').notNull(), // 'supplier' or 'horeca'
  status: text('status').notNull().default('unclaimed'), // 'unclaimed', 'claimed', 'archived'
  description: text('description'),
  logoUrl: text('logo_url'),
  phone: text('phone'),
  email: text('email'),
  address: text('address'),
  deliveryAddress: text('delivery_address'),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
  archivedAt: timestamp('archived_at'),
})

export const membership = pgTable(
  'membership',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id),
    organizationId: text('organization_id')
      .notNull()
      .references(() => organization.id),
    role: text('role').notNull().default('member'), // 'owner' or 'member'
    createdAt: timestamp('created_at').notNull(),
    updatedAt: timestamp('updated_at').notNull(),
  },
  (table) => [unique().on(table.userId, table.organizationId)],
)

export const invitation = pgTable('invitation', {
  id: text('id').primaryKey(),
  organizationId: text('organization_id')
    .notNull()
    .references(() => organization.id),
  invitedBy: text('invited_by')
    .notNull()
    .references(() => user.id),
  email: text('email').notNull(),
  role: text('role').notNull().default('member'), // 'owner' or 'member'
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  acceptedAt: timestamp('accepted_at'),
  rejectedAt: timestamp('rejected_at'),
  createdAt: timestamp('created_at').notNull(),
})
