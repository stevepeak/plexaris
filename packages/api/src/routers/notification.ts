import { eq, schema, sql } from '@app/db'
import { and } from 'drizzle-orm'
import { z } from 'zod'

import { verifyAccess } from '../lib/verify-access'
import { protectedProcedure, router } from '../trpc'

const NOTIFICATION_TYPES = schema.notificationTypeEnum.enumValues

export const notificationRouter = router({
  getPreferences: protectedProcedure
    .input(z.object({ organizationId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      await verifyAccess(
        ctx.db,
        ctx.session.user.id,
        input.organizationId,
        ctx.session.user.superAdmin,
      )

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
      await verifyAccess(
        ctx.db,
        ctx.session.user.id,
        input.organizationId,
        ctx.session.user.superAdmin,
      )

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
