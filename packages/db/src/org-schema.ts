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

// --- Permissions ---

export const PERMISSIONS = {
  create_order: 'create_order',
  edit_order: 'edit_order',
  place_order: 'place_order',
  invite_members: 'invite_members',
  manage_roles: 'manage_roles',
  manage_agents: 'manage_agents',
  manage_products: 'manage_products',
  edit_org_details: 'edit_org_details',
} as const

export const ALL_PERMISSIONS = Object.values(PERMISSIONS)

export const ADMIN_ROLE_NAME = 'Admin'

export const DEFAULT_MEMBER_PERMISSIONS = [
  PERMISSIONS.create_order,
  PERMISSIONS.edit_order,
  PERMISSIONS.place_order,
]

// --- Enums ---

export const organizationTypeEnum = pgEnum('organization_type', [
  'supplier',
  'horeca',
])

// --- Tables ---

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
  createdAt: timestamp('created_at', {
    withTimezone: true,
    mode: 'date',
  }).notNull(),
  updatedAt: timestamp('updated_at', {
    withTimezone: true,
    mode: 'date',
  }).notNull(),
  archivedAt: timestamp('archived_at', { withTimezone: true, mode: 'date' }),
})

export const role = pgTable(
  'role',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organization.id),
    name: text('name').notNull(),
    isSystem: boolean('is_system').notNull().default(false),
    permissions: text('permissions').array().notNull().default([]),
    createdAt: timestamp('created_at', {
      withTimezone: true,
      mode: 'date',
    }).notNull(),
    updatedAt: timestamp('updated_at', {
      withTimezone: true,
      mode: 'date',
    }).notNull(),
  },
  (table) => [unique().on(table.organizationId, table.name)],
)

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
    roleId: uuid('role_id')
      .notNull()
      .references(() => role.id),
    createdAt: timestamp('created_at', {
      withTimezone: true,
      mode: 'date',
    }).notNull(),
    updatedAt: timestamp('updated_at', {
      withTimezone: true,
      mode: 'date',
    }).notNull(),
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
  expiresAt: timestamp('expires_at', {
    withTimezone: true,
    mode: 'date',
  }).notNull(),
  usedAt: timestamp('used_at', { withTimezone: true, mode: 'date' }),
  createdAt: timestamp('created_at', {
    withTimezone: true,
    mode: 'date',
  }).notNull(),
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
  roleId: uuid('role_id')
    .notNull()
    .references(() => role.id),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at', {
    withTimezone: true,
    mode: 'date',
  }).notNull(),
  acceptedAt: timestamp('accepted_at', { withTimezone: true, mode: 'date' }),
  rejectedAt: timestamp('rejected_at', { withTimezone: true, mode: 'date' }),
  createdAt: timestamp('created_at', {
    withTimezone: true,
    mode: 'date',
  }).notNull(),
})
