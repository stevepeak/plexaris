import { and, count, createDb, eq, schema } from '@app/db'
import { NextResponse } from 'next/server'

import { auth } from '@/lib/auth'
import { checkPermission } from '@/lib/permissions'

const db = createDb()

// PATCH /api/organizations/[id]/members/[membershipId]/role — Change a member's role
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; membershipId: string }> },
) {
  const session = await auth.api.getSession({
    headers: request.headers,
  })

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id, membershipId } = await params

  const perm = await checkPermission(session.user.id, id, 'manage_roles')

  if (!perm) {
    return NextResponse.json(
      { error: 'You do not have permission to manage roles' },
      { status: 403 },
    )
  }

  const body = await request.json()
  const { roleId } = body

  if (!roleId) {
    return NextResponse.json({ error: 'roleId is required' }, { status: 400 })
  }

  // Verify the target role belongs to this org
  const targetRole = await db.query.role.findFirst({
    where: and(eq(schema.role.id, roleId), eq(schema.role.organizationId, id)),
  })

  if (!targetRole) {
    return NextResponse.json(
      { error: 'Invalid role for this organization' },
      { status: 400 },
    )
  }

  // Get the membership being changed
  const targetMembership = await db.query.membership.findFirst({
    where: and(
      eq(schema.membership.id, membershipId),
      eq(schema.membership.organizationId, id),
    ),
  })

  if (!targetMembership) {
    return NextResponse.json({ error: 'Membership not found' }, { status: 404 })
  }

  // If removing someone from Admin, ensure at least 1 admin remains
  const currentRole = await db.query.role.findFirst({
    where: eq(schema.role.id, targetMembership.roleId),
  })

  if (currentRole?.isSystem && !targetRole.isSystem) {
    const [{ value: adminCount }] = await db
      .select({ value: count() })
      .from(schema.membership)
      .innerJoin(schema.role, eq(schema.membership.roleId, schema.role.id))
      .where(
        and(
          eq(schema.membership.organizationId, id),
          eq(schema.role.isSystem, true),
        ),
      )

    if (adminCount <= 1) {
      return NextResponse.json(
        { error: 'Cannot remove the last admin' },
        { status: 400 },
      )
    }
  }

  await db
    .update(schema.membership)
    .set({ roleId, updatedAt: new Date() })
    .where(eq(schema.membership.id, membershipId))

  return NextResponse.json({ success: true })
}
