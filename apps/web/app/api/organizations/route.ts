import { createDb, eq, schema } from '@app/db'
import { NextResponse } from 'next/server'

import { auth } from '@/lib/auth'

const db = createDb()

export async function POST(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  })

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { name, type, description, phone, email, address, deliveryAddress } =
    body

  if (!name || !type || !['supplier', 'horeca'].includes(type)) {
    return NextResponse.json(
      { error: 'Name and valid type (supplier or horeca) are required' },
      { status: 400 },
    )
  }

  const now = new Date()
  const orgId = crypto.randomUUID()
  const membershipId = crypto.randomUUID()

  await db.insert(schema.organization).values({
    id: orgId,
    name,
    type,
    status: 'claimed',
    description: description || null,
    phone: phone || null,
    email: email || null,
    address: address || null,
    deliveryAddress: deliveryAddress || null,
    createdAt: now,
    updatedAt: now,
  })

  await db.insert(schema.membership).values({
    id: membershipId,
    userId: session.user.id,
    organizationId: orgId,
    role: 'owner',
    createdAt: now,
    updatedAt: now,
  })

  const org = await db.query.organization.findFirst({
    where: eq(schema.organization.id, orgId),
  })

  return NextResponse.json({ organization: org }, { status: 201 })
}
