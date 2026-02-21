import { and, createDb, eq, isNull, schema } from '@app/db'
import { NextResponse } from 'next/server'

import { auth } from '@/lib/auth'

const db = createDb()

// GET /api/invitations/pending — List pending invitations for the current user's email
export async function GET(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  })

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const invitations = await db
    .select({
      id: schema.invitation.id,
      email: schema.invitation.email,
      roleName: schema.role.name,
      token: schema.invitation.token,
      createdAt: schema.invitation.createdAt,
      expiresAt: schema.invitation.expiresAt,
      organizationName: schema.organization.name,
      organizationType: schema.organization.type,
      invitedByName: schema.user.name,
    })
    .from(schema.invitation)
    .innerJoin(
      schema.organization,
      eq(schema.invitation.organizationId, schema.organization.id),
    )
    .innerJoin(schema.user, eq(schema.invitation.invitedBy, schema.user.id))
    .innerJoin(schema.role, eq(schema.invitation.roleId, schema.role.id))
    .where(
      and(
        eq(schema.invitation.email, session.user.email),
        isNull(schema.invitation.acceptedAt),
        isNull(schema.invitation.rejectedAt),
      ),
    )

  return NextResponse.json({ invitations })
}
