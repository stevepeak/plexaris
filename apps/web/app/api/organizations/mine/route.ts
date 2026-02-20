import { and, count, createDb, eq, inArray, isNull, schema } from '@app/db'
import { NextResponse } from 'next/server'

import { auth } from '@/lib/auth'

const db = createDb()

export async function GET(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  })

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const rows = await db
    .select({
      id: schema.organization.id,
      name: schema.organization.name,
      type: schema.organization.type,
      claimed: schema.organization.claimed,
      logoUrl: schema.organization.logoUrl,
      role: schema.membership.role,
    })
    .from(schema.membership)
    .innerJoin(
      schema.organization,
      eq(schema.membership.organizationId, schema.organization.id),
    )
    .where(
      and(
        eq(schema.membership.userId, session.user.id),
        isNull(schema.organization.archivedAt),
      ),
    )

  // For orgs where the user is an owner, determine if they're the sole owner
  const ownerOrgIds = rows.filter((r) => r.role === 'owner').map((r) => r.id)

  const ownerCounts = new Map<string, number>()

  if (ownerOrgIds.length > 0) {
    const counts = await db
      .select({
        organizationId: schema.membership.organizationId,
        value: count(),
      })
      .from(schema.membership)
      .where(
        and(
          eq(schema.membership.role, 'owner'),
          inArray(schema.membership.organizationId, ownerOrgIds),
        ),
      )
      .groupBy(schema.membership.organizationId)

    for (const c of counts) {
      ownerCounts.set(c.organizationId, c.value)
    }
  }

  const organizations = rows.map((r) => ({
    ...r,
    soleOwner: r.role === 'owner' && (ownerCounts.get(r.id) ?? 0) <= 1,
  }))

  return NextResponse.json({ organizations })
}
