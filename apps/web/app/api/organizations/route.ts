import { createDb, schema } from '@app/db'
import {
  ADMIN_ROLE_NAME,
  ALL_PERMISSIONS,
  DEFAULT_MEMBER_PERMISSIONS,
} from '@app/db/schema'
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
  const {
    name,
    type,
    description,
    phone,
    email,
    address,
    deliveryAddress,
    urls,
  } = body

  if (!name || !type || !['supplier', 'horeca'].includes(type)) {
    return NextResponse.json(
      { error: 'Name and valid type (supplier or horeca) are required' },
      { status: 400 },
    )
  }

  const now = new Date()

  // Parse URLs if provided
  const parsedUrls: string[] = urls
    ? (urls as string)
        .split('\n')
        .map((u: string) => u.trim())
        .filter(Boolean)
    : []

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
      data:
        parsedUrls.length > 0 ? { urls: parsedUrls, scrapeIssues: [] } : null,
      createdAt: now,
      updatedAt: now,
    })
    .returning()

  // Create Admin + Member roles
  const [adminRole] = await db
    .insert(schema.role)
    .values({
      organizationId: org.id,
      name: ADMIN_ROLE_NAME,
      isSystem: true,
      permissions: ALL_PERMISSIONS,
      createdAt: now,
      updatedAt: now,
    })
    .returning()

  await db.insert(schema.role).values({
    organizationId: org.id,
    name: 'Member',
    isSystem: false,
    permissions: DEFAULT_MEMBER_PERMISSIONS,
    createdAt: now,
    updatedAt: now,
  })

  // Assign creator as Admin
  await db.insert(schema.membership).values({
    userId: session.user.id,
    organizationId: org.id,
    roleId: adminRole.id,
    createdAt: now,
    updatedAt: now,
  })

  return NextResponse.json({ organization: org }, { status: 201 })
}
