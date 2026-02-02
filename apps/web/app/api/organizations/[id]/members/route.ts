import { and, createDb, eq, schema } from '@app/db'
import { NextResponse } from 'next/server'

import { auth } from '@/lib/auth'

const db = createDb()

// GET /api/organizations/[id]/members — List members of an org
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
    })
    .from(schema.membership)
    .innerJoin(schema.user, eq(schema.membership.userId, schema.user.id))
    .where(eq(schema.membership.organizationId, id))

  return NextResponse.json({ members })
}
