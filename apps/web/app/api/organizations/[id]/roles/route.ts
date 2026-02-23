import { logAudit } from '@app/api'
import { createDb, eq, schema } from '@app/db'
import { ADMIN_ROLE_NAME, ALL_PERMISSIONS } from '@app/db/schema'
import { NextResponse } from 'next/server'

import { auth } from '@/lib/auth'
import { checkMembership, checkPermission } from '@/lib/permissions'

const db = createDb()

// GET /api/organizations/[id]/roles — List all roles for the org
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

  const roles = await db.query.role.findMany({
    where: eq(schema.role.organizationId, id),
    orderBy: (role, { asc }) => [asc(role.createdAt)],
  })

  return NextResponse.json({ roles })
}

// POST /api/organizations/[id]/roles — Create a custom role
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

  const perm = await checkPermission(session.user.id, id, 'manage_roles')

  if (!perm) {
    return NextResponse.json(
      { error: 'You do not have permission to manage roles' },
      { status: 403 },
    )
  }

  const body = await request.json()
  const { name, permissions } = body

  if (!name || typeof name !== 'string' || !name.trim()) {
    return NextResponse.json(
      { error: 'Role name is required' },
      { status: 400 },
    )
  }

  if (name.trim() === ADMIN_ROLE_NAME) {
    return NextResponse.json(
      { error: 'Cannot create a role named "Admin"' },
      { status: 400 },
    )
  }

  if (!Array.isArray(permissions)) {
    return NextResponse.json(
      { error: 'Permissions must be an array' },
      { status: 400 },
    )
  }

  const invalidPerms = permissions.filter(
    (p: string) => !(ALL_PERMISSIONS as string[]).includes(p),
  )
  if (invalidPerms.length > 0) {
    return NextResponse.json(
      { error: `Invalid permissions: ${invalidPerms.join(', ')}` },
      { status: 400 },
    )
  }

  const now = new Date()

  const [role] = await db
    .insert(schema.role)
    .values({
      organizationId: id,
      name: name.trim(),
      isSystem: false,
      permissions,
      createdAt: now,
      updatedAt: now,
    })
    .returning()

  await logAudit(db, {
    organizationId: id,
    actorId: session.user.id,
    action: 'role.created',
    entityType: 'role',
    entityId: role!.id,
    payload: { name: name.trim(), permissions },
  })

  return NextResponse.json({ role }, { status: 201 })
}
