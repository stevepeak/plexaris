import { and, desc, eq, isNotNull, isNull, schema } from '@app/db'
import { z } from 'zod'

import { verifyAccess } from '../lib/verify-access'
import { protectedProcedure, router } from '../trpc'

export const productRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        organizationId: z.string().uuid(),
        archived: z.boolean().optional().default(false),
      }),
    )
    .query(async ({ ctx, input }) => {
      await verifyAccess(
        ctx.db,
        ctx.session.user.id,
        input.organizationId,
        ctx.session.user.superAdmin,
      )

      return ctx.db.query.product.findMany({
        where: and(
          eq(schema.product.organizationId, input.organizationId),
          input.archived
            ? isNotNull(schema.product.archivedAt)
            : isNull(schema.product.archivedAt),
        ),
        orderBy: [desc(schema.product.createdAt)],
      })
    }),
})
