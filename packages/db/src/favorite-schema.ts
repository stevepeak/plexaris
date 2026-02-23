import {
  index,
  pgEnum,
  pgTable,
  timestamp,
  unique,
  uuid,
} from 'drizzle-orm/pg-core'

import { organization } from './org-schema'

export const favoriteTargetTypeEnum = pgEnum('favorite_target_type', [
  'product',
  'supplier',
  'recipe',
])

export const favorite = pgTable(
  'favorite',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organization.id),
    targetType: favoriteTargetTypeEnum('target_type').notNull(),
    targetId: uuid('target_id').notNull(),
    createdAt: timestamp('created_at', {
      withTimezone: true,
      mode: 'date',
    }).notNull(),
  },
  (table) => [
    unique().on(table.organizationId, table.targetType, table.targetId),
    index('favorite_target_id_idx').on(table.targetId),
  ],
)
