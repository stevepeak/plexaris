import { and, createDb, eq, schema } from '@app/db'
import { NextResponse } from 'next/server'

import { auth } from '@/lib/auth'

const db = createDb()

// GET /api/organizations/[id] — Get org details
export async function GET(
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
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const org = await db.query.organization.findFirst({
    where: eq(schema.organization.id, id),
  })

  if (!org) {
    return NextResponse.json(
      { error: 'Organization not found' },
      { status: 404 },
    )
  }

  return NextResponse.json({ organization: org, role: membership.role })
}

// PATCH /api/organizations/[id] — Update org details (owners only)
export async function PATCH(
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

  // Verify user is an owner
  const membership = await db.query.membership.findFirst({
    where: and(
      eq(schema.membership.userId, session.user.id),
      eq(schema.membership.organizationId, id),
      eq(schema.membership.role, 'owner'),
    ),
  })

  if (!membership) {
    return NextResponse.json(
      { error: 'Only organization owners can update details' },
      { status: 403 },
    )
  }

  const body = await request.json()
  const { name, description, phone, email, address, deliveryAddress } = body

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return NextResponse.json(
      { error: 'Organization name is required' },
      { status: 400 },
    )
  }

  await db
    .update(schema.organization)
    .set({
      name: name.trim(),
      description: description || null,
      phone: phone || null,
      email: email || null,
      address: address || null,
      deliveryAddress: deliveryAddress || null,
      updatedAt: new Date(),
    })
    .where(eq(schema.organization.id, id))

  const org = await db.query.organization.findFirst({
    where: eq(schema.organization.id, id),
  })

  return NextResponse.json({ organization: org })
}
