import { createDb, eq, schema } from '@app/db'
import { NextResponse } from 'next/server'

import { auth } from '@/lib/auth'

const db = createDb()

export async function GET(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  })

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const rows = await db
    .select({
      id: schema.organization.id,
      name: schema.organization.name,
      type: schema.organization.type,
      status: schema.organization.status,
      role: schema.membership.role,
    })
    .from(schema.membership)
    .innerJoin(
      schema.organization,
      eq(schema.membership.organizationId, schema.organization.id),
    )
    .where(eq(schema.membership.userId, session.user.id))

  return NextResponse.json({ organizations: rows })
}
