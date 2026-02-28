import { and, eq, schema } from '@app/db'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'

import { protectedProcedure, router } from '../trpc'

export const fileRouter = router({
  list: protectedProcedure
    .input(z.object({ organizationId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const rows = await ctx.db
        .select({
          id: schema.file.id,
          name: schema.file.name,
          mimeType: schema.file.mimeType,
          size: schema.file.size,
          url: schema.file.url,
          createdAt: schema.file.createdAt,
        })
        .from(schema.file)
        .where(eq(schema.file.organizationId, input.organizationId))

      return rows
    }),

  delete: protectedProcedure
    .input(
      z.object({
        fileId: z.string().uuid(),
        organizationId: z.string().uuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [deleted] = await ctx.db
        .delete(schema.file)
        .where(
          and(
            eq(schema.file.id, input.fileId),
            eq(schema.file.organizationId, input.organizationId),
          ),
        )
        .returning({ id: schema.file.id })

      if (!deleted) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'File not found' })
      }

      return { id: deleted.id }
    }),
})
