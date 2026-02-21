import { type DB, eq, inArray, schema } from '@app/db'
import { auth, runs } from '@trigger.dev/sdk'
import { TRPCError } from '@trpc/server'
import { and, count, desc } from 'drizzle-orm'
import { z } from 'zod'

import { protectedProcedure, router } from '../trpc'

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

async function fetchPublicAccessToken(
  triggerRunId: string,
): Promise<string | null> {
  try {
    // Use the Trigger.dev SDK to create a public access token
    // The SDK automatically uses TRIGGER_SECRET_KEY from environment
    const token = await auth.createPublicToken({
      scopes: {
        read: {
          runs: [triggerRunId],
        },
      },
      expirationTime: '1hr',
    })
    return token
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[fetchPublicAccessToken] Failed to create token:', error)
    return null
  }
}

export const triggerRunRouter = router({
  list: protectedProcedure
    .input(z.object({ organizationId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      await verifyMembership(ctx.db, ctx.session.user.id, input.organizationId)

      const runs = await ctx.db
        .select()
        .from(schema.triggerRun)
        .where(
          and(
            eq(schema.triggerRun.organizationId, input.organizationId),
            eq(schema.triggerRun.status, 'running'),
          ),
        )

      const results = await Promise.all(
        runs.map(async (run) => {
          const publicAccessToken = await fetchPublicAccessToken(
            run.triggerRunId,
          )
          return {
            id: run.id,
            triggerRunId: run.triggerRunId,
            taskType: run.taskType,
            label: run.label,
            status: run.status,
            publicAccessToken,
          }
        }),
      )

      return results
    }),

  getPublicAccessToken: protectedProcedure
    .input(z.object({ triggerRunId: z.string() }))
    .query(async ({ ctx, input }) => {
      // Verify the user has access to this run via their organization membership
      const [run] = await ctx.db
        .select({
          organizationId: schema.triggerRun.organizationId,
        })
        .from(schema.triggerRun)
        .where(eq(schema.triggerRun.triggerRunId, input.triggerRunId))
        .limit(1)

      if (!run) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Run not found',
        })
      }

      await verifyMembership(ctx.db, ctx.session.user.id, run.organizationId)

      const token = await fetchPublicAccessToken(input.triggerRunId)
      return { publicAccessToken: token }
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      // Fetch the task from our database
      const [result] = await ctx.db
        .select({
          task: schema.triggerRun,
          creatorName: schema.user.name,
          creatorImage: schema.user.image,
        })
        .from(schema.triggerRun)
        .leftJoin(schema.user, eq(schema.triggerRun.createdBy, schema.user.id))
        .where(eq(schema.triggerRun.id, input.id))
        .limit(1)

      const task = result?.task
      const creator = result?.creatorName
        ? { name: result.creatorName, image: result.creatorImage }
        : null

      if (!task) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Task not found',
        })
      }

      // Verify membership
      await verifyMembership(ctx.db, ctx.session.user.id, task.organizationId)

      // Fetch run details from Trigger.dev
      let triggerRunDetails: Awaited<ReturnType<typeof runs.retrieve>> | null =
        null
      try {
        triggerRunDetails = await runs.retrieve(task.triggerRunId)
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('[getById] Failed to fetch run details:', error)
      }

      // Get public access token for real-time updates
      const publicAccessToken = await fetchPublicAccessToken(task.triggerRunId)

      // Extract payload and resolve file records
      const payload = (triggerRunDetails?.payload ?? null) as Record<
        string,
        unknown
      > | null
      const fileIds = Array.isArray(payload?.fileIds)
        ? (payload.fileIds as string[])
        : []

      const files =
        fileIds.length > 0
          ? await ctx.db
              .select({
                id: schema.file.id,
                name: schema.file.name,
                mimeType: schema.file.mimeType,
                size: schema.file.size,
                url: schema.file.url,
              })
              .from(schema.file)
              .where(inArray(schema.file.id, fileIds))
          : []

      return {
        id: task.id,
        triggerRunId: task.triggerRunId,
        organizationId: task.organizationId,
        taskType: task.taskType,
        label: task.label,
        status: task.status,
        creator,
        createdAt: task.createdAt.toISOString(),
        updatedAt: task.updatedAt.toISOString(),
        publicAccessToken,
        payload,
        files,
        triggerRun: triggerRunDetails
          ? {
              id: triggerRunDetails.id,
              status: triggerRunDetails.status,
              createdAt: triggerRunDetails.createdAt?.toISOString() ?? null,
              updatedAt: triggerRunDetails.updatedAt?.toISOString() ?? null,
              startedAt: triggerRunDetails.startedAt?.toISOString() ?? null,
              finishedAt: triggerRunDetails.finishedAt?.toISOString() ?? null,
              output: triggerRunDetails.output ?? null,
              error: triggerRunDetails.error ?? null,
              metadata: triggerRunDetails.metadata ?? null,
              isCompleted: triggerRunDetails.isCompleted,
              isFailed: triggerRunDetails.isFailed,
              isCancelled: triggerRunDetails.isCancelled,
              isExecuting: triggerRunDetails.isExecuting,
            }
          : null,
      }
    }),

  listAll: protectedProcedure
    .input(
      z.object({
        organizationId: z.string().uuid(),
        page: z.number().int().min(1).default(1),
        limit: z.number().int().min(1).max(100).default(15),
      }),
    )
    .query(async ({ ctx, input }) => {
      await verifyMembership(ctx.db, ctx.session.user.id, input.organizationId)

      const where = eq(schema.triggerRun.organizationId, input.organizationId)

      const [rows, [{ total }]] = await Promise.all([
        ctx.db
          .select({
            task: schema.triggerRun,
            creatorName: schema.user.name,
            creatorImage: schema.user.image,
          })
          .from(schema.triggerRun)
          .leftJoin(
            schema.user,
            eq(schema.triggerRun.createdBy, schema.user.id),
          )
          .where(where)
          .orderBy(desc(schema.triggerRun.createdAt))
          .limit(input.limit)
          .offset((input.page - 1) * input.limit),
        ctx.db.select({ total: count() }).from(schema.triggerRun).where(where),
      ])

      return {
        items: rows.map(({ task, creatorName, creatorImage }) => ({
          id: task.id,
          triggerRunId: task.triggerRunId,
          taskType: task.taskType,
          label: task.label,
          status: task.status,
          creator: creatorName
            ? { name: creatorName, image: creatorImage }
            : null,
          createdAt: task.createdAt.toISOString(),
          updatedAt: task.updatedAt.toISOString(),
        })),
        total,
        page: input.page,
        totalPages: Math.ceil(total / input.limit),
      }
    }),
})
