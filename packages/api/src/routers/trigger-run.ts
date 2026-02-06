import { type DB, eq, schema } from '@app/db'
import { TRPCError } from '@trpc/server'
import { and } from 'drizzle-orm'
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
  // eslint-disable-next-line no-process-env
  const secretKey = process.env.TRIGGER_SECRET_KEY
  if (!secretKey) return null

  try {
    const res = await fetch(
      `https://api.trigger.dev/api/v1/runs/${triggerRunId}/token`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${secretKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          permissions: {
            read: { runs: true, tags: true },
            triggers: { runs: true },
          },
        }),
      },
    )

    if (!res.ok) return null

    const data = (await res.json()) as { token?: string }
    return data.token ?? null
  } catch {
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
})
