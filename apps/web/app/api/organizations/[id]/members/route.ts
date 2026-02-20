import { and, createDb, eq, isNull, schema, sql } from '@app/db'
import { NextResponse } from 'next/server'

import { auth } from '@/lib/auth'

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

  // Verify user is a member of the org
  const userMembership = await db.query.membership.findFirst({
    where: and(
      eq(schema.membership.userId, session.user.id),
      eq(schema.membership.organizationId, id),
    ),
  })

  if (!userMembership) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const members = await db
    .select({
      id: schema.membership.id,
      userId: schema.membership.userId,
      role: schema.membership.role,
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
    .where(eq(schema.membership.organizationId, id))

  // Pending invitations (not accepted, not rejected, not expired)
  const invitations = await db
    .select({
      id: schema.invitation.id,
      email: schema.invitation.email,
      role: schema.invitation.role,
      createdAt: schema.invitation.createdAt,
      invitedByName: schema.user.name,
    })
    .from(schema.invitation)
    .innerJoin(schema.user, eq(schema.invitation.invitedBy, schema.user.id))
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
