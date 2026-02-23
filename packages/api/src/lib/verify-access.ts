import { and, type DB, eq, schema } from '@app/db'
import { TRPCError } from '@trpc/server'

export async function hasPermission(
  db: DB,
  userId: string,
  organizationId: string,
  superAdmin: boolean,
  permission: string,
): Promise<boolean> {
  if (superAdmin) return true

  const [row] = await db
    .select({ permissions: schema.role.permissions })
    .from(schema.membership)
    .innerJoin(schema.role, eq(schema.membership.roleId, schema.role.id))
    .where(
      and(
        eq(schema.membership.userId, userId),
        eq(schema.membership.organizationId, organizationId),
      ),
    )
    .limit(1)

  return row?.permissions.includes(permission) ?? false
}

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
