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

  const [org] = await db
    .insert(schema.organization)
    .values({
      name,
      type,
      claimed: true,
      description: description || null,
      phone: phone || null,
      email: email || null,
      address: address || null,
      deliveryAddress: deliveryAddress || null,
      createdAt: now,
      updatedAt: now,
    })
    .returning()

  await db.insert(schema.membership).values({
    userId: session.user.id,
    organizationId: org.id,
    role: 'owner',
    createdAt: now,
    updatedAt: now,
  })

  return NextResponse.json({ organization: org }, { status: 201 })
}
