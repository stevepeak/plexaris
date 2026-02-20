import { createDb, eq, schema } from '@app/db'
import { NextResponse } from 'next/server'

import { auth } from '@/lib/auth'

const db = createDb()

// POST /api/account/archive — Delete and anonymize the current user's account
export async function POST(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  })

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check if user still has any org memberships — they must leave first
  const memberships = await db.query.membership.findMany({
    where: eq(schema.membership.userId, session.user.id),
  })

  if (memberships.length > 0) {
    return NextResponse.json(
      {
        error: 'Leave all organizations before deleting your account.',
      },
      { status: 400 },
    )
  }

  // Anonymize user data (GDPR right-to-erasure)
  await db
    .update(schema.user)
    .set({
      name: 'Ghost',
      email: `deleted-${session.user.id}@deleted.local`,
      image: null,
      phone: null,
      contactPreference: null,
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
