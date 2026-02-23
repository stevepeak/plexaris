import { and, createDb, eq, schema } from '@app/db'

const db = createDb()

const SUPER_ADMIN_RESULT = {
  membershipId: 'super-admin',
  roleId: 'super-admin',
  roleName: 'Super Admin',
  isSystem: true as const,
  permissions: schema.ALL_PERMISSIONS,
}

async function isSuperAdmin(userId: string): Promise<boolean> {
  const [row] = await db
    .select({ superAdmin: schema.user.superAdmin })
    .from(schema.user)
    .where(eq(schema.user.id, userId))
    .limit(1)

  return row?.superAdmin === true
}

export async function checkPermission(
  userId: string,
  orgId: string,
  permission: string,
) {
  if (await isSuperAdmin(userId)) return SUPER_ADMIN_RESULT

  const [result] = await db
    .select({
      membershipId: schema.membership.id,
      roleId: schema.role.id,
      roleName: schema.role.name,
      isSystem: schema.role.isSystem,
      permissions: schema.role.permissions,
    })
    .from(schema.membership)
    .innerJoin(schema.role, eq(schema.membership.roleId, schema.role.id))
    .where(
      and(
        eq(schema.membership.userId, userId),
        eq(schema.membership.organizationId, orgId),
      ),
    )
    .limit(1)

  if (!result) return null
  if (result.isSystem) return result
  if (result.permissions.includes(permission)) return result
  return null
}

export async function checkMembership(userId: string, orgId: string) {
  if (await isSuperAdmin(userId)) return SUPER_ADMIN_RESULT

  const [result] = await db
    .select({
      membershipId: schema.membership.id,
      roleId: schema.role.id,
      roleName: schema.role.name,
      isSystem: schema.role.isSystem,
      permissions: schema.role.permissions,
    })
    .from(schema.membership)
    .innerJoin(schema.role, eq(schema.membership.roleId, schema.role.id))
    .where(
      and(
        eq(schema.membership.userId, userId),
        eq(schema.membership.organizationId, orgId),
      ),
    )
    .limit(1)

  return result ?? null
}

export async function isAdmin(userId: string, orgId: string) {
  const result = await checkMembership(userId, orgId)
  return result?.isSystem === true
}
