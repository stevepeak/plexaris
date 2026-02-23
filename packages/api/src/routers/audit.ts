import { count, desc, eq, ilike, or, schema } from '@app/db'
import { and } from 'drizzle-orm'
import { z } from 'zod'

import { verifyAccess } from '../lib/verify-access'
import { protectedProcedure, router } from '../trpc'

export const auditRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        organizationId: z.string().uuid(),
        page: z.number().int().min(1).default(1),
        limit: z.number().int().min(1).max(100).default(20),
        entityType: z.string().optional(),
        search: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      await verifyAccess(
        ctx.db,
        ctx.session.user.id,
        input.organizationId,
        ctx.session.user.superAdmin,
      )

      const conditions = [
        eq(schema.auditLog.organizationId, input.organizationId),
      ]

      if (input.entityType) {
        conditions.push(eq(schema.auditLog.entityType, input.entityType))
      }

      if (input.search) {
        const pattern = `%${input.search}%`
        conditions.push(
          or(
            ilike(schema.auditLog.action, pattern),
            ilike(schema.user.name, pattern),
          )!,
        )
      }

      const where = and(...conditions)

      const [rows, [{ total }]] = await Promise.all([
        ctx.db
          .select({
            id: schema.auditLog.id,
            action: schema.auditLog.action,
            entityType: schema.auditLog.entityType,
            entityId: schema.auditLog.entityId,
            payload: schema.auditLog.payload,
            createdAt: schema.auditLog.createdAt,
            actorName: schema.user.name,
            actorImage: schema.user.image,
          })
          .from(schema.auditLog)
          .innerJoin(schema.user, eq(schema.auditLog.actorId, schema.user.id))
          .where(where)
          .orderBy(desc(schema.auditLog.createdAt))
          .limit(input.limit)
          .offset((input.page - 1) * input.limit),
        ctx.db
          .select({ total: count() })
          .from(schema.auditLog)
          .innerJoin(schema.user, eq(schema.auditLog.actorId, schema.user.id))
          .where(where),
      ])

      return {
        items: rows.map((r) => ({
          id: r.id,
          action: r.action,
          entityType: r.entityType,
          entityId: r.entityId,
          payload: r.payload,
          createdAt: r.createdAt.toISOString(),
          actorName: r.actorName,
          actorImage: r.actorImage,
        })),
        total,
        page: input.page,
        totalPages: Math.ceil(total / input.limit),
      }
    }),
})
