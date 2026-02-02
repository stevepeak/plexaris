import { and, createDb, eq, schema } from '@app/db'
import { NextResponse } from 'next/server'

import { auth } from '@/lib/auth'

const db = createDb()

// POST /api/organizations/[id]/leave — Leave an organization
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

  // Verify user is a member
  const membership = await db.query.membership.findFirst({
    where: and(
      eq(schema.membership.userId, session.user.id),
      eq(schema.membership.organizationId, id),
    ),
  })

  if (!membership) {
    return NextResponse.json(
      { error: 'You are not a member of this organization' },
      { status: 403 },
    )
  }

  // Owners cannot leave — they must archive the org instead
  if (membership.role === 'owner') {
    return NextResponse.json(
      {
        error:
          'Organization owners cannot leave. Archive the organization instead.',
      },
      { status: 400 },
    )
  }

  // Delete the membership
  await db
    .delete(schema.membership)
    .where(eq(schema.membership.id, membership.id))

  return NextResponse.json({ success: true })
}
