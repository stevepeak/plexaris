import { and, createDb, eq, schema } from '@app/db'
import { NextResponse } from 'next/server'

import { auth } from '@/lib/auth'
import { checkMembership, checkPermission } from '@/lib/permissions'

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

  const member = await checkMembership(session.user.id, id)

  if (!member) {
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

  return NextResponse.json({
    organization: org,
    role: {
      id: member.roleId,
      name: member.roleName,
      isSystem: member.isSystem,
      permissions: member.permissions,
    },
  })
}

// PATCH /api/organizations/[id] — Update org details
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

  const perm = await checkPermission(session.user.id, id, 'edit_org_details')

  if (!perm) {
    return NextResponse.json(
      { error: 'You do not have permission to update organization details' },
      { status: 403 },
    )
  }

  const body = await request.json()
  const {
    name,
    description,
    phone,
    email,
    address,
    deliveryAddress,
    logoUrl,
    deliveryAreas,
  } = body

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
      logoUrl: logoUrl || null,
      deliveryAreas: deliveryAreas || null,
      updatedAt: new Date(),
    })
    .where(eq(schema.organization.id, id))

  const org = await db.query.organization.findFirst({
    where: eq(schema.organization.id, id),
  })

  return NextResponse.json({ organization: org })
}
