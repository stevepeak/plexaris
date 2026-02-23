import { and, type DB, eq, schema } from '@app/db'
import { TRPCError } from '@trpc/server'

export async function verifyAccess(
  db: DB,
  userId: string,
  organizationId: string,
  superAdmin: boolean,
) {
  if (superAdmin) return

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
