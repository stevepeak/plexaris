import { and, createDb, eq, schema } from '@app/db'
import { NextResponse } from 'next/server'

import { auth } from '@/lib/auth'

const db = createDb()

// POST /api/organizations/[id]/archive — Archive an organization (owners only)
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

  // Verify user is an owner
  const membership = await db.query.membership.findFirst({
    where: and(
      eq(schema.membership.userId, session.user.id),
      eq(schema.membership.organizationId, id),
      eq(schema.membership.role, 'owner'),
    ),
  })

  if (!membership) {
    return NextResponse.json(
      { error: 'Only organization owners can archive' },
      { status: 403 },
    )
  }

  // Soft-delete: set status to archived and archivedAt timestamp
  await db
    .update(schema.organization)
    .set({
      status: 'archived',
      archivedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(schema.organization.id, id))

  return NextResponse.json({ success: true })
}
