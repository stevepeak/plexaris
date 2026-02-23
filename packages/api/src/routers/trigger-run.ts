import { eq, inArray, schema } from '@app/db'
import { auth, runs } from '@trigger.dev/sdk'
import { TRPCError } from '@trpc/server'
import { and, count, desc } from 'drizzle-orm'
import { z } from 'zod'

import { verifyAccess } from '../lib/verify-access'
import { protectedProcedure, router } from '../trpc'

async function fetchPublicAccessToken(
  triggerRunId: string,
  captureException?: (error: unknown, extra?: Record<string, unknown>) => void,
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
    captureException?.(error, { triggerRunId })
    return null
  }
}

export const triggerRunRouter = router({
  list: protectedProcedure
    .input(z.object({ organizationId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      await verifyAccess(
        ctx.db,
        ctx.session.user.id,
        input.organizationId,
        ctx.session.user.superAdmin,
      )

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
            ctx.captureException,
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

      await verifyAccess(
        ctx.db,
        ctx.session.user.id,
        run.organizationId,
        ctx.session.user.superAdmin,
      )

      const token = await fetchPublicAccessToken(
        input.triggerRunId,
        ctx.captureException,
      )
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
      await verifyAccess(
        ctx.db,
        ctx.session.user.id,
        task.organizationId,
        ctx.session.user.superAdmin,
      )

      // Fetch run details from Trigger.dev
      let triggerRunDetails: Awaited<ReturnType<typeof runs.retrieve>> | null =
        null
      try {
        triggerRunDetails = await runs.retrieve(task.triggerRunId)
      } catch (error) {
        ctx.captureException(error, {
          triggerRunId: task.triggerRunId,
          taskId: input.id,
        })
      }

      // Get public access token for real-time updates
      const publicAccessToken = await fetchPublicAccessToken(
        task.triggerRunId,
        ctx.captureException,
      )

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
      await verifyAccess(
        ctx.db,
        ctx.session.user.id,
        input.organizationId,
        ctx.session.user.superAdmin,
      )

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
