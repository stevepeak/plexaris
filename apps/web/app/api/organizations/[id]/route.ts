import { trackEvent } from '@app/api'
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

  // Fetch current values before update for diff
  const [before] = await db
    .select({
      name: schema.organization.name,
      description: schema.organization.description,
      phone: schema.organization.phone,
      email: schema.organization.email,
      address: schema.organization.address,
      deliveryAddress: schema.organization.deliveryAddress,
      logoUrl: schema.organization.logoUrl,
      deliveryAreas: schema.organization.deliveryAreas,
    })
    .from(schema.organization)
    .where(eq(schema.organization.id, id))
    .limit(1)

  const updates = {
    name: name.trim(),
    description: (description || null) as string | null,
    phone: (phone || null) as string | null,
    email: (email || null) as string | null,
    address: (address || null) as string | null,
    deliveryAddress: (deliveryAddress || null) as string | null,
    logoUrl: (logoUrl || null) as string | null,
    deliveryAreas: (deliveryAreas || null) as string | null,
  }

  // Build changes object: only fields that actually changed
  const changes: Record<string, { from: string | null; to: string | null }> = {}
  if (before) {
    for (const key of Object.keys(updates) as (keyof typeof updates)[]) {
      const oldVal = before[key] ?? null
      const newVal = updates[key] ?? null
      if (oldVal !== newVal) {
        changes[key] = { from: oldVal, to: newVal }
      }
    }
  }

  await db
    .update(schema.organization)
    .set({
      ...updates,
      updatedAt: new Date(),
    })
    .where(eq(schema.organization.id, id))

  await trackEvent(db, {
    organizationId: id,
    actorId: session.user.id,
    action: 'organization.updated',
    entityType: 'organization',
    entityId: id,
    payload: { changes },
  })

  const org = await db.query.organization.findFirst({
    where: eq(schema.organization.id, id),
  })

  return NextResponse.json({ organization: org })
}
