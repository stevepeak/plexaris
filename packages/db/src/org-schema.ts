import {
  boolean,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from 'drizzle-orm/pg-core'

import { user } from './auth-schema'

export const organizationTypeEnum = pgEnum('organization_type', [
  'supplier',
  'horeca',
])

export const membershipRoleEnum = pgEnum('membership_role', ['owner', 'member'])

export const organization = pgTable('organization', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  type: organizationTypeEnum('type').notNull(),
  claimed: boolean('claimed').notNull().default(false),
  description: text('description'),
  logoUrl: text('logo_url'),
  phone: text('phone'),
  email: text('email'),
  address: text('address'),
  deliveryAddress: text('delivery_address'),
  deliveryAreas: text('delivery_areas'),
  data: jsonb('data'),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
  archivedAt: timestamp('archived_at'),
})

export const membership = pgTable(
  'membership',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organization.id),
    role: membershipRoleEnum('role').notNull().default('member'),
    createdAt: timestamp('created_at').notNull(),
    updatedAt: timestamp('updated_at').notNull(),
  },
  (table) => [unique().on(table.userId, table.organizationId)],
)

export const claimToken = pgTable('claim_token', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id')
    .notNull()
    .references(() => organization.id),
  email: text('email').notNull(),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  usedAt: timestamp('used_at'),
  createdAt: timestamp('created_at').notNull(),
})

export const invitation = pgTable('invitation', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id')
    .notNull()
    .references(() => organization.id),
  invitedBy: text('invited_by')
    .notNull()
    .references(() => user.id),
  email: text('email').notNull(),
  role: membershipRoleEnum('role').notNull().default('member'),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  acceptedAt: timestamp('accepted_at'),
  rejectedAt: timestamp('rejected_at'),
  createdAt: timestamp('created_at').notNull(),
})
