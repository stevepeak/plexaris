import { and, createDb, eq, isNull, schema, sql } from '@app/db'
import { NextResponse } from 'next/server'

import { auth } from '@/lib/auth'
import { checkMembership } from '@/lib/permissions'

const db = createDb()

// GET /api/organizations/[id]/members — List members and pending invitations
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({
    headers: request.headers,
  })

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  const member = await checkMembership(session.user.id, id)

  if (!member) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const members = await db
    .select({
      id: schema.membership.id,
      userId: schema.membership.userId,
      roleId: schema.role.id,
      roleName: schema.role.name,
      isSystemRole: schema.role.isSystem,
      createdAt: schema.membership.createdAt,
      userName: schema.user.name,
      userEmail: schema.user.email,
      userImage: schema.user.image,
      lastLoginAt: sql<
        string | null
      >`(SELECT MAX(created_at) FROM session WHERE user_id = ${schema.membership.userId})`.as(
        'last_login_at',
      ),
    })
    .from(schema.membership)
    .innerJoin(schema.user, eq(schema.membership.userId, schema.user.id))
    .innerJoin(schema.role, eq(schema.membership.roleId, schema.role.id))
    .where(eq(schema.membership.organizationId, id))

  // Pending invitations (not accepted, not rejected, not expired)
  const invitations = await db
    .select({
      id: schema.invitation.id,
      email: schema.invitation.email,
      roleName: schema.role.name,
      createdAt: schema.invitation.createdAt,
      invitedByName: schema.user.name,
    })
    .from(schema.invitation)
    .innerJoin(schema.user, eq(schema.invitation.invitedBy, schema.user.id))
    .innerJoin(schema.role, eq(schema.invitation.roleId, schema.role.id))
    .where(
      and(
        eq(schema.invitation.organizationId, id),
        isNull(schema.invitation.acceptedAt),
        isNull(schema.invitation.rejectedAt),
        sql`${schema.invitation.expiresAt} > NOW()`,
      ),
    )

  return NextResponse.json({ members, invitations })
}
