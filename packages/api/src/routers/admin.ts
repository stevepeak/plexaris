import { count, desc, eq, ilike, isNull, or, schema } from '@app/db'
import { TRPCError } from '@trpc/server'
import { and } from 'drizzle-orm'
import { z } from 'zod'

import { protectedProcedure, router } from '../trpc'

export const adminRouter = router({
  listOrganizations: protectedProcedure
    .input(
      z.object({
        search: z.string().optional(),
        type: z.enum(['supplier', 'horeca']).optional(),
        page: z.number().int().min(1).default(1),
        limit: z.number().int().min(1).max(100).default(20),
      }),
    )
    .query(async ({ ctx, input }) => {
      if (!ctx.session.user.superAdmin) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Super admin access required',
        })
      }

      const conditions = [isNull(schema.organization.archivedAt)]

      if (input.search) {
        conditions.push(
          or(
            ilike(schema.organization.name, `%${input.search}%`),
            ilike(schema.organization.email, `%${input.search}%`),
          )!,
        )
      }

      if (input.type) {
        conditions.push(eq(schema.organization.type, input.type))
      }

      const where = and(...conditions)

      const orderCount = ctx.db
        .select({
          orgId: schema.order.organizationId,
          count: count().as('order_count'),
        })
        .from(schema.order)
        .where(isNull(schema.order.archivedAt))
        .groupBy(schema.order.organizationId)
        .as('order_counts')

      const suggestionCount = ctx.db
        .select({
          orgId: schema.suggestion.organizationId,
          count: count().as('suggestion_count'),
        })
        .from(schema.suggestion)
        .groupBy(schema.suggestion.organizationId)
        .as('suggestion_counts')

      const productCount = ctx.db
        .select({
          orgId: schema.product.organizationId,
          count: count().as('product_count'),
        })
        .from(schema.product)
        .where(isNull(schema.product.archivedAt))
        .groupBy(schema.product.organizationId)
        .as('product_counts')

      const memberCount = ctx.db
        .select({
          orgId: schema.membership.organizationId,
          count: count().as('member_count'),
        })
        .from(schema.membership)
        .groupBy(schema.membership.organizationId)
        .as('member_counts')

      const [rows, [{ total }]] = await Promise.all([
        ctx.db
          .select({
            id: schema.organization.id,
            name: schema.organization.name,
            type: schema.organization.type,
            logoUrl: schema.organization.logoUrl,
            claimed: schema.organization.claimed,
            createdAt: schema.organization.createdAt,
            updatedAt: schema.organization.updatedAt,
            orderCount: orderCount.count,
            suggestionCount: suggestionCount.count,
            productCount: productCount.count,
            memberCount: memberCount.count,
          })
          .from(schema.organization)
          .leftJoin(orderCount, eq(schema.organization.id, orderCount.orgId))
          .leftJoin(
            suggestionCount,
            eq(schema.organization.id, suggestionCount.orgId),
          )
          .leftJoin(
            productCount,
            eq(schema.organization.id, productCount.orgId),
          )
          .leftJoin(memberCount, eq(schema.organization.id, memberCount.orgId))
          .where(where)
          .orderBy(desc(schema.organization.updatedAt))
          .limit(input.limit)
          .offset((input.page - 1) * input.limit),
        ctx.db
          .select({ total: count() })
          .from(schema.organization)
          .where(where),
      ])

      return {
        items: rows.map((r) => ({
          id: r.id,
          name: r.name,
          type: r.type,
          logoUrl: r.logoUrl,
          claimed: r.claimed,
          createdAt: r.createdAt.toISOString(),
          lastInteraction: r.updatedAt.toISOString(),
          orderCount: r.orderCount ?? 0,
          suggestionCount: r.suggestionCount ?? 0,
          productCount: r.productCount ?? 0,
          memberCount: r.memberCount ?? 0,
        })),
        total,
        page: input.page,
        totalPages: Math.ceil(total / input.limit),
      }
    }),
})
