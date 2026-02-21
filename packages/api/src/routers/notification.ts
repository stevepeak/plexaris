import { type DB, eq, schema, sql } from '@app/db'
import { TRPCError } from '@trpc/server'
import { and } from 'drizzle-orm'
import { z } from 'zod'

import { protectedProcedure, router } from '../trpc'

const NOTIFICATION_TYPES = schema.notificationTypeEnum.enumValues

async function verifyMembership(
  db: DB,
  userId: string,
  organizationId: string,
) {
  const [row] = await db
    .select({ id: schema.membership.id })
    .from(schema.membership)
    .where(
      and(
        eq(schema.membership.userId, userId),
        eq(schema.membership.organizationId, organizationId),
      ),
    )
    .limit(1)

  if (!row) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Not a member of this organization',
    })
  }
}

export const notificationRouter = router({
  getPreferences: protectedProcedure
    .input(z.object({ organizationId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      await verifyMembership(ctx.db, ctx.session.user.id, input.organizationId)

      const rows = await ctx.db
        .select()
        .from(schema.notificationPreference)
        .where(
          and(
            eq(schema.notificationPreference.userId, ctx.session.user.id),
            eq(
              schema.notificationPreference.organizationId,
              input.organizationId,
            ),
          ),
        )

      const rowMap = new Map(rows.map((r) => [r.notificationType, r]))

      return NOTIFICATION_TYPES.map((type) => {
        const row = rowMap.get(type)
        return {
          notificationType: type,
          email: row?.email ?? true,
          sms: row?.sms ?? true,
        }
      })
    }),

  updatePreference: protectedProcedure
    .input(
      z.object({
        organizationId: z.string().uuid(),
        notificationType: z.enum(NOTIFICATION_TYPES),
        channel: z.enum(['email', 'sms']),
        enabled: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await verifyMembership(ctx.db, ctx.session.user.id, input.organizationId)

      const now = new Date()
      const columnMap = {
        email: schema.notificationPreference.email,
        sms: schema.notificationPreference.sms,
      } as const

      await ctx.db
        .insert(schema.notificationPreference)
        .values({
          userId: ctx.session.user.id,
          organizationId: input.organizationId,
          notificationType: input.notificationType,
          email: input.channel === 'email' ? input.enabled : true,
          sms: input.channel === 'sms' ? input.enabled : true,
          createdAt: now,
          updatedAt: now,
        })
        .onConflictDoUpdate({
          target: [
            schema.notificationPreference.userId,
            schema.notificationPreference.organizationId,
            schema.notificationPreference.notificationType,
          ],
          set: {
            [columnMap[input.channel].name]: sql`${input.enabled}`,
            updatedAt: now,
          },
        })
    }),
})
