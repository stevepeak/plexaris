import { and, createDb, eq, isNull, schema } from '@app/db'
import { NextResponse } from 'next/server'

import { auth } from '@/lib/auth'

const db = createDb()

// POST /api/invitations/[id]/accept — Accept an invitation
export async function POST(
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

  const invitation = await db.query.invitation.findFirst({
    where: and(
      eq(schema.invitation.id, id),
      eq(schema.invitation.email, session.user.email),
      isNull(schema.invitation.acceptedAt),
      isNull(schema.invitation.rejectedAt),
    ),
  })

  if (!invitation) {
    return NextResponse.json(
      { error: 'Invitation not found or already handled' },
      { status: 404 },
    )
  }

  if (invitation.expiresAt < new Date()) {
    return NextResponse.json(
      { error: 'Invitation has expired' },
      { status: 410 },
    )
  }

  // Create membership with the invitation's roleId
  const now = new Date()
  await db.insert(schema.membership).values({
    userId: session.user.id,
    organizationId: invitation.organizationId,
    roleId: invitation.roleId,
    createdAt: now,
    updatedAt: now,
  })

  // Mark invitation as accepted
  await db
    .update(schema.invitation)
    .set({ acceptedAt: now })
    .where(eq(schema.invitation.id, id))

  return NextResponse.json({ success: true })
}
