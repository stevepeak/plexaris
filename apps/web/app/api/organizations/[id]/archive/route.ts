import { createDb, eq, schema } from '@app/db'
import { NextResponse } from 'next/server'

import { auth } from '@/lib/auth'
import { isAdmin } from '@/lib/permissions'

const db = createDb()

// POST /api/organizations/[id]/archive — Archive an organization (admins only)
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

  const admin = await isAdmin(session.user.id, id)

  if (!admin) {
    return NextResponse.json(
      { error: 'Only admins can archive the organization' },
      { status: 403 },
    )
  }

  // Soft-delete: set archivedAt timestamp
  await db
    .update(schema.organization)
    .set({
      archivedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(schema.organization.id, id))

  return NextResponse.json({ success: true })
}
