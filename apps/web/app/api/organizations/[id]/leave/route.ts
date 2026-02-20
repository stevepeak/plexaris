import { and, count, createDb, eq, schema } from '@app/db'
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

  // Sole owners cannot leave — they must transfer ownership or archive the org
  if (membership.role === 'owner') {
    const [{ value: ownerCount }] = await db
      .select({ value: count() })
      .from(schema.membership)
      .where(
        and(
          eq(schema.membership.organizationId, id),
          eq(schema.membership.role, 'owner'),
        ),
      )

    if (ownerCount <= 1) {
      return NextResponse.json(
        {
          error:
            "You're the sole owner. Transfer ownership or archive the organization first.",
        },
        { status: 400 },
      )
    }
  }

  // Delete the membership
  await db
    .delete(schema.membership)
    .where(eq(schema.membership.id, membership.id))

  return NextResponse.json({ success: true })
}
