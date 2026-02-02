import { createDb, eq, schema } from '@app/db'
import { NextResponse } from 'next/server'

import { auth } from '@/lib/auth'

const db = createDb()

// POST /api/account/archive — Archive the current user's account
export async function POST(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  })

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check if user owns any organizations — they must archive those first
  const ownedOrgs = await db.query.membership.findMany({
    where: eq(schema.membership.userId, session.user.id),
  })

  const ownerMemberships = ownedOrgs.filter((m) => m.role === 'owner')
  if (ownerMemberships.length > 0) {
    return NextResponse.json(
      {
        error:
          'You must archive all organizations you own before archiving your account.',
      },
      { status: 400 },
    )
  }

  // Remove all memberships
  await db
    .delete(schema.membership)
    .where(eq(schema.membership.userId, session.user.id))

  // Soft-delete the user account
  await db
    .update(schema.user)
    .set({
      archivedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(schema.user.id, session.user.id))

  // Revoke all sessions
  await db
    .delete(schema.session)
    .where(eq(schema.session.userId, session.user.id))

  return NextResponse.json({ success: true })
}
