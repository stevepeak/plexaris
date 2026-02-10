import { eq, schema } from '@app/db'
import {
  type discoverProductsTask,
  type exampleAgentTask,
  type scrapeOrganizationTask,
} from '@app/trigger'
import { tasks } from '@trigger.dev/sdk'
import { z } from 'zod'

import { agentScheduleRouter } from './routers/agent-schedule'
import { notificationRouter } from './routers/notification'
import { orderRouter } from './routers/order'
import { suggestionRouter } from './routers/suggestion'
import { triggerRunRouter } from './routers/trigger-run'
import { protectedProcedure, publicProcedure, router } from './trpc'

export type { Context } from './context'

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
  exampleAgent: publicProcedure
    .input(z.object({ name: z.string().optional() }))
    .mutation(async ({ input }) => {
      const handle = await tasks.trigger<typeof exampleAgentTask>(
        'example-agent',
        {
          name: input.name,
        },
      )

      return {
        runId: handle.id,
        publicAccessToken: handle.publicAccessToken,
      }
    }),

  scrapeOrganization: protectedProcedure
    .input(z.object({ organizationId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { organizationId } = input

      // Fetch the org's URLs and type from data jsonb
      const [org] = await ctx.db
        .select({
          data: schema.organization.data,
          type: schema.organization.type,
        })
        .from(schema.organization)
        .where(eq(schema.organization.id, organizationId))
        .limit(1)

      if (!org) {
        throw new Error('Organization not found')
      }

      const orgData = org.data as { urls?: string[] } | null
      const urls = orgData?.urls ?? []

      // Fetch file IDs for this org
      const files = await ctx.db
        .select({ id: schema.file.id })
        .from(schema.file)
        .where(eq(schema.file.organizationId, organizationId))

      const fileIds = files.map((f) => f.id)

      // Trigger the scrape-organization task
      const handle = await tasks.trigger<typeof scrapeOrganizationTask>(
        'scrape-organization',
        { organizationId, urls, fileIds },
      )

      // Insert trigger_run row so the active tasks card picks it up immediately
      const now = new Date()
      await ctx.db.insert(schema.triggerRun).values({
        organizationId,
        triggerRunId: handle.id,
        taskType: 'scrape-organization',
        label: `Scraping ${urls[0] ?? 'uploaded files'}`,
        status: 'running',
        createdAt: now,
        updatedAt: now,
      })

      // Trigger product discovery for suppliers in parallel
      if (org.type === 'supplier') {
        const discoverHandle = await tasks.trigger<typeof discoverProductsTask>(
          'discover-products',
          { organizationId, urls, fileIds },
        )

        await ctx.db.insert(schema.triggerRun).values({
          organizationId,
          triggerRunId: discoverHandle.id,
          taskType: 'discover-products',
          label: 'Discovering products...',
          status: 'running',
          createdAt: now,
          updatedAt: now,
        })
      }

      return { runId: handle.id }
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
        throw new Error('Organization not found')
      }

      const orgData = org.data as { urls?: string[] } | null
      const urls = orgData?.urls ?? []

      // Fetch file IDs for this org
      const files = await ctx.db
        .select({ id: schema.file.id })
        .from(schema.file)
        .where(eq(schema.file.organizationId, organizationId))

      const fileIds = files.map((f) => f.id)

      // Trigger the scrape-organization task
      const handle = await tasks.trigger<typeof scrapeOrganizationTask>(
        'scrape-organization',
        { organizationId, urls, fileIds },
      )

      // Insert trigger_run row so the active tasks card picks it up immediately
      const now = new Date()
      await ctx.db.insert(schema.triggerRun).values({
        organizationId,
        triggerRunId: handle.id,
        taskType: 'scrape-organization',
        label: `Scraping ${urls[0] ?? 'uploaded files'}`,
        status: 'running',
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
        throw new Error('Organization not found')
      }

      const orgData = org.data as { urls?: string[] } | null
      const urls = orgData?.urls ?? []

      // Fetch file IDs for this org
      const files = await ctx.db
        .select({ id: schema.file.id })
        .from(schema.file)
        .where(eq(schema.file.organizationId, organizationId))

      const fileIds = files.map((f) => f.id)

      // Trigger the discover-products task
      const handle = await tasks.trigger<typeof discoverProductsTask>(
        'discover-products',
        { organizationId, urls, fileIds },
      )

      // Insert trigger_run row so the active tasks card picks it up immediately
      const now = new Date()
      await ctx.db.insert(schema.triggerRun).values({
        organizationId,
        triggerRunId: handle.id,
        taskType: 'discover-products',
        label: 'Discovering products...',
        status: 'running',
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
  suggestion: suggestionRouter,
  order: orderRouter,
  notification: notificationRouter,
})

// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter
