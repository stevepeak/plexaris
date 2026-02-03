import { and, createDb, eq, ilike, isNull, or, schema } from '@app/db'
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

  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search')

  const conditions = [
    eq(schema.organization.type, 'supplier'),
    isNull(schema.organization.archivedAt),
  ]

  if (search) {
    const pattern = `%${search}%`
    conditions.push(
      or(
        ilike(schema.organization.name, pattern),
        ilike(schema.organization.description, pattern),
      )!,
    )
  }

  const rows = await db
    .select({
      id: schema.organization.id,
      name: schema.organization.name,
      description: schema.organization.description,
    })
    .from(schema.organization)
    .where(and(...conditions))
    .orderBy(schema.organization.name)

  return NextResponse.json({ suppliers: rows })
}
