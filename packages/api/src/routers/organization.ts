import { and, count, eq, inArray, isNull, schema } from '@app/db'

import { protectedProcedure, router } from '../trpc'

export const organizationRouter = router({
  mine: protectedProcedure.query(async ({ ctx }) => {
    const rows = await ctx.db
      .select({
        id: schema.organization.id,
        name: schema.organization.name,
        type: schema.organization.type,
        claimed: schema.organization.claimed,
        logoUrl: schema.organization.logoUrl,
        roleId: schema.role.id,
        roleName: schema.role.name,
        isAdmin: schema.role.isSystem,
        permissions: schema.role.permissions,
      })
      .from(schema.membership)
      .innerJoin(
        schema.organization,
        eq(schema.membership.organizationId, schema.organization.id),
      )
      .innerJoin(schema.role, eq(schema.membership.roleId, schema.role.id))
      .where(
        and(
          eq(schema.membership.userId, ctx.session.user.id),
          isNull(schema.organization.archivedAt),
        ),
      )

    // For orgs where the user is an admin, determine if they're the sole admin
    const adminOrgIds = rows.filter((r) => r.isAdmin).map((r) => r.id)

    const adminCounts = new Map<string, number>()

    if (adminOrgIds.length > 0) {
      const counts = await ctx.db
        .select({
          organizationId: schema.membership.organizationId,
          value: count(),
        })
        .from(schema.membership)
        .innerJoin(schema.role, eq(schema.membership.roleId, schema.role.id))
        .where(
          and(
            eq(schema.role.isSystem, true),
            inArray(schema.membership.organizationId, adminOrgIds),
          ),
        )
        .groupBy(schema.membership.organizationId)

      for (const c of counts) {
        adminCounts.set(c.organizationId, c.value)
      }
    }

    const organizations = rows.map((r) => ({
      ...r,
      soleAdmin: r.isAdmin && (adminCounts.get(r.id) ?? 0) <= 1,
    }))

    return { organizations, superAdmin: ctx.session.user.superAdmin }
  }),
})
