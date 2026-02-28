import { eq, schema } from '@app/db'
import { type alignSourcesTask } from '@app/trigger'
import { tasks } from '@trigger.dev/sdk'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'

import { adminRouter } from './routers/admin'
import { agentScheduleRouter } from './routers/agent-schedule'
import { auditRouter } from './routers/audit'
import { fileRouter } from './routers/file'
import { notificationRouter } from './routers/notification'
import { orderRouter } from './routers/order'
import { organizationRouter } from './routers/organization'
import { productRouter } from './routers/product'
import { suggestionRouter } from './routers/suggestion'
import { triggerRunRouter } from './routers/trigger-run'
import { protectedProcedure, publicProcedure, router } from './trpc'

export type { Context } from './context'
export { trackEvent } from './lib/audit'

const helloRouter = router({
  world: publicProcedure
    .input(z.object({ name: z.string().optional() }))
    .query(({ input }) => {
      return {
        message: `Hello ${input.name ?? 'World'}!`,
      }
    }),
})

const triggerRouter = router({
  scrapeOrganization: protectedProcedure
    .input(
      z.object({
        organizationId: z.string().uuid(),
        filesOnly: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { organizationId, filesOnly } = input

      // Fetch the org's URLs from data jsonb
      const [org] = await ctx.db
        .select({ data: schema.organization.data })
        .from(schema.organization)
        .where(eq(schema.organization.id, organizationId))
        .limit(1)

      if (!org) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Organization not found',
        })
      }

      const orgData = org.data as { urls?: string[] } | null
      const urls = filesOnly ? [] : (orgData?.urls ?? [])

      // Fetch file IDs for this org
      const files = await ctx.db
        .select({ id: schema.file.id })
        .from(schema.file)
        .where(eq(schema.file.organizationId, organizationId))

      const fileIds = files.map((f) => f.id)

      // Trigger the align-sources orchestrator
      const handle = await tasks.trigger<typeof alignSourcesTask>(
        'align-sources',
        { organizationId, urls, fileIds },
        {
          tags: [`org_${organizationId}`, `user_${ctx.session.user.id}`],
        },
      )

      // Insert trigger_run row so the active tasks card picks it up immediately
      const now = new Date()
      const [insertedRun] = await ctx.db
        .insert(schema.triggerRun)
        .values({
          organizationId,
          triggerRunId: handle.id,
          taskType: 'align-sources',
          label: filesOnly
            ? 'Processing uploaded files'
            : `Processing ${urls.length + fileIds.length} sources`,
          status: 'running',
          createdBy: ctx.session.user.id,
          createdAt: now,
          updatedAt: now,
        })
        .returning({ id: schema.triggerRun.id })

      return {
        runId: handle.id,
        publicAccessToken: handle.publicAccessToken,
        taskId: insertedRun!.id,
      }
    }),

  scrapeOrganizationDetails: protectedProcedure
    .input(z.object({ organizationId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { organizationId } = input

      // Fetch the org's URLs from data jsonb
      const [org] = await ctx.db
        .select({ data: schema.organization.data })
        .from(schema.organization)
        .where(eq(schema.organization.id, organizationId))
        .limit(1)

      if (!org) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Organization not found',
        })
      }

      const orgData = org.data as { urls?: string[] } | null
      const urls = orgData?.urls ?? []

      // Fetch file IDs for this org
      const files = await ctx.db
        .select({ id: schema.file.id })
        .from(schema.file)
        .where(eq(schema.file.organizationId, organizationId))

      const fileIds = files.map((f) => f.id)

      // Trigger the align-sources orchestrator
      const handle = await tasks.trigger<typeof alignSourcesTask>(
        'align-sources',
        { organizationId, urls, fileIds },
        {
          tags: [`org_${organizationId}`, `user_${ctx.session.user.id}`],
        },
      )

      // Insert trigger_run row so the active tasks card picks it up immediately
      const now = new Date()
      await ctx.db.insert(schema.triggerRun).values({
        organizationId,
        triggerRunId: handle.id,
        taskType: 'align-sources',
        label: `Processing ${urls.length + fileIds.length} sources`,
        status: 'running',
        createdBy: ctx.session.user.id,
        createdAt: now,
        updatedAt: now,
      })

      return { runId: handle.id }
    }),

  discoverProducts: protectedProcedure
    .input(z.object({ organizationId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { organizationId } = input

      // Fetch the org's URLs from data jsonb
      const [org] = await ctx.db
        .select({ data: schema.organization.data })
        .from(schema.organization)
        .where(eq(schema.organization.id, organizationId))
        .limit(1)

      if (!org) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Organization not found',
        })
      }

      const orgData = org.data as { urls?: string[] } | null
      const urls = orgData?.urls ?? []

      // Fetch file IDs for this org
      const files = await ctx.db
        .select({ id: schema.file.id })
        .from(schema.file)
        .where(eq(schema.file.organizationId, organizationId))

      const fileIds = files.map((f) => f.id)

      // Trigger the align-sources orchestrator
      const handle = await tasks.trigger<typeof alignSourcesTask>(
        'align-sources',
        { organizationId, urls, fileIds },
        {
          tags: [`org_${organizationId}`, `user_${ctx.session.user.id}`],
        },
      )

      // Insert trigger_run row so the active tasks card picks it up immediately
      const now = new Date()
      await ctx.db.insert(schema.triggerRun).values({
        organizationId,
        triggerRunId: handle.id,
        taskType: 'align-sources',
        label: `Discovering products from ${urls.length + fileIds.length} sources`,
        status: 'running',
        createdBy: ctx.session.user.id,
        createdAt: now,
        updatedAt: now,
      })

      return { runId: handle.id }
    }),
})

export const appRouter = router({
  hello: helloRouter,
  trigger: triggerRouter,
  triggerRun: triggerRunRouter,
  agentSchedule: agentScheduleRouter,
  file: fileRouter,
  suggestion: suggestionRouter,
  order: orderRouter,
  product: productRouter,
  notification: notificationRouter,
  audit: auditRouter,
  admin: adminRouter,
  organization: organizationRouter,
})

// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter
