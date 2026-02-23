import { eq, schema } from '@app/db'
import { type alignSourcesTask, type scheduledAgentTask } from '@app/trigger'
import { schedules, tasks } from '@trigger.dev/sdk'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'

import { verifyAccess } from '../lib/verify-access'
import { protectedProcedure, router } from '../trpc'

const scheduleTypeLabels: Record<string, string> = {
  org_information_update: 'Organization Information Update',
  product_updating: 'Product Updating',
  competitive_analysis: 'Competitive Analysis',
  reduce_cost_analysis: 'Reduce Cost Analysis',
}

const frequencyToCron: Record<string, string> = {
  daily: '0 6 * * *',
  weekly: '0 6 * * 1',
  biweekly: '0 6 1,15 * *',
  monthly: '0 6 1 * *',
}

function computeNextRunAt(frequency: string): Date {
  const now = new Date()

  switch (frequency) {
    case 'daily': {
      // Next 06:00 UTC
      const next = new Date(now)
      next.setUTCHours(6, 0, 0, 0)
      if (next <= now) next.setUTCDate(next.getUTCDate() + 1)
      return next
    }
    case 'weekly': {
      // Next Monday 06:00 UTC
      const next = new Date(now)
      next.setUTCHours(6, 0, 0, 0)
      const daysUntilMonday = (8 - next.getUTCDay()) % 7 || 7
      if (next <= now || next.getUTCDay() !== 1) {
        next.setUTCDate(next.getUTCDate() + daysUntilMonday)
      }
      return next
    }
    case 'biweekly': {
      // Next 1st or 15th of month 06:00 UTC
      const next = new Date(now)
      next.setUTCHours(6, 0, 0, 0)
      const day = next.getUTCDate()
      if (day < 15 && (day > 1 || next <= now)) {
        next.setUTCDate(15)
      } else if (day >= 15 || next <= now) {
        next.setUTCMonth(next.getUTCMonth() + 1, 1)
      }
      return next
    }
    case 'monthly': {
      // Next 1st of month 06:00 UTC
      const next = new Date(now)
      next.setUTCHours(6, 0, 0, 0)
      next.setUTCDate(1)
      if (next <= now) {
        next.setUTCMonth(next.getUTCMonth() + 1, 1)
      }
      return next
    }
    default:
      return now
  }
}

export const agentScheduleRouter = router({
  list: protectedProcedure
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
        .from(schema.agentSchedule)
        .where(eq(schema.agentSchedule.organizationId, input.organizationId))

      return rows.map((row) => ({
        id: row.id,
        organizationId: row.organizationId,
        name: row.name,
        scheduleType: row.scheduleType,
        frequency: row.frequency,
        cron: row.cron,
        urls: row.urls,
        nextRunAt: computeNextRunAt(row.frequency).toISOString(),
        createdAt: row.createdAt.toISOString(),
        updatedAt: row.updatedAt.toISOString(),
      }))
    }),

  create: protectedProcedure
    .input(
      z.object({
        organizationId: z.string().uuid(),
        name: z.string().optional(),
        scheduleType: z.enum([
          'org_information_update',
          'product_updating',
          'competitive_analysis',
          'reduce_cost_analysis',
        ]),
        frequency: z.enum(['daily', 'weekly', 'biweekly', 'monthly']),
        urls: z.array(z.string().min(1)).default([]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await verifyAccess(
        ctx.db,
        ctx.session.user.id,
        input.organizationId,
        ctx.session.user.superAdmin,
      )

      // Validate per-type requirements
      const typesRequiringUrls = [
        'org_information_update',
        'product_updating',
      ] as const
      if (
        typesRequiringUrls.includes(
          input.scheduleType as (typeof typesRequiringUrls)[number],
        ) &&
        input.urls.length === 0
      ) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'At least one URL is required for this schedule type',
        })
      }

      const cron = frequencyToCron[input.frequency]
      if (!cron) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Invalid frequency',
        })
      }

      // Pre-generate UUID so we can use it as externalId
      const id = crypto.randomUUID()

      // Create the Trigger.dev schedule
      const createdSchedule = await schedules.create({
        task: 'scheduled-agent' satisfies (typeof scheduledAgentTask)['id'],
        cron,
        externalId: id,
        deduplicationKey: `${input.organizationId}-${input.scheduleType}`,
      })

      const now = new Date()
      await ctx.db.insert(schema.agentSchedule).values({
        id,
        organizationId: input.organizationId,
        name: input.name || scheduleTypeLabels[input.scheduleType] || null,
        scheduleType: input.scheduleType,
        frequency: input.frequency,
        cron,
        urls: input.urls,
        triggerScheduleId: createdSchedule.id,
        createdAt: now,
        updatedAt: now,
      })

      return { id }
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const [schedule] = await ctx.db
        .select()
        .from(schema.agentSchedule)
        .where(eq(schema.agentSchedule.id, input.id))
        .limit(1)

      if (!schedule) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Schedule not found',
        })
      }

      await verifyAccess(
        ctx.db,
        ctx.session.user.id,
        schedule.organizationId,
        ctx.session.user.superAdmin,
      )

      // Delete the Trigger.dev schedule
      if (schedule.triggerScheduleId) {
        try {
          await schedules.del(schedule.triggerScheduleId)
        } catch {
          // Schedule may already be deleted on Trigger.dev side
        }
      }

      await ctx.db
        .delete(schema.agentSchedule)
        .where(eq(schema.agentSchedule.id, input.id))

      return { success: true }
    }),

  runNow: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const [schedule] = await ctx.db
        .select()
        .from(schema.agentSchedule)
        .where(eq(schema.agentSchedule.id, input.id))
        .limit(1)

      if (!schedule) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Schedule not found',
        })
      }

      await verifyAccess(
        ctx.db,
        ctx.session.user.id,
        schedule.organizationId,
        ctx.session.user.superAdmin,
      )

      const { organizationId, scheduleType, urls } = schedule

      // Fetch file IDs for this org
      const files = await ctx.db
        .select({ id: schema.file.id })
        .from(schema.file)
        .where(eq(schema.file.organizationId, organizationId))

      const fileIds = files.map((f) => f.id)
      const now = new Date()

      const handle = await tasks.trigger<typeof alignSourcesTask>(
        'align-sources',
        { organizationId, urls, fileIds },
      )

      await ctx.db.insert(schema.triggerRun).values({
        organizationId,
        triggerRunId: handle.id,
        taskType: 'align-sources',
        label: `Manual run: ${scheduleType.replace(/_/g, ' ')}`,
        status: 'running',
        createdBy: ctx.session.user.id,
        createdAt: now,
        updatedAt: now,
      })

      return { runId: handle.id }
    }),
})
