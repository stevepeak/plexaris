import { logAudit } from '@app/api'
import { and, createDb, eq, schema } from '@app/db'
import { ADMIN_ROLE_NAME, ALL_PERMISSIONS } from '@app/db/schema'
import { NextResponse } from 'next/server'

import { auth } from '@/lib/auth'
import { checkPermission } from '@/lib/permissions'

const db = createDb()

// PATCH /api/organizations/[id]/roles/[roleId] — Update a role
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; roleId: string }> },
) {
  const session = await auth.api.getSession({
    headers: request.headers,
  })

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id, roleId } = await params

  const perm = await checkPermission(session.user.id, id, 'manage_roles')

  if (!perm) {
    return NextResponse.json(
      { error: 'You do not have permission to manage roles' },
      { status: 403 },
    )
  }

  const existing = await db.query.role.findFirst({
    where: and(eq(schema.role.id, roleId), eq(schema.role.organizationId, id)),
  })

  if (!existing) {
    return NextResponse.json({ error: 'Role not found' }, { status: 404 })
  }

  if (existing.isSystem) {
    return NextResponse.json(
      { error: 'System roles cannot be edited' },
      { status: 400 },
    )
  }

  const body = await request.json()
  const { name, permissions } = body

  if (name !== undefined) {
    if (typeof name !== 'string' || !name.trim()) {
      return NextResponse.json(
        { error: 'Role name cannot be empty' },
        { status: 400 },
      )
    }
    if (name.trim() === ADMIN_ROLE_NAME) {
      return NextResponse.json(
        { error: 'Cannot use the name "Admin"' },
        { status: 400 },
      )
    }
  }

  if (permissions !== undefined) {
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
  }

  const changes: Record<string, { from: unknown; to: unknown }> = {}
  if (name !== undefined && name.trim() !== existing.name) {
    changes.name = { from: existing.name, to: name.trim() }
  }
  if (
    permissions !== undefined &&
    JSON.stringify(permissions) !== JSON.stringify(existing.permissions)
  ) {
    changes.permissions = { from: existing.permissions, to: permissions }
  }

  const [updated] = await db
    .update(schema.role)
    .set({
      ...(name !== undefined && { name: name.trim() }),
      ...(permissions !== undefined && { permissions }),
      updatedAt: new Date(),
    })
    .where(eq(schema.role.id, roleId))
    .returning()

  await logAudit(db, {
    organizationId: id,
    actorId: session.user.id,
    action: 'role.updated',
    entityType: 'role',
    entityId: roleId,
    payload: { changes },
  })

  return NextResponse.json({ role: updated })
}

// DELETE /api/organizations/[id]/roles/[roleId] — Delete a role
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; roleId: string }> },
) {
  const session = await auth.api.getSession({
    headers: request.headers,
  })

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id, roleId } = await params

  const perm = await checkPermission(session.user.id, id, 'manage_roles')

  if (!perm) {
    return NextResponse.json(
      { error: 'You do not have permission to manage roles' },
      { status: 403 },
    )
  }

  const existing = await db.query.role.findFirst({
    where: and(eq(schema.role.id, roleId), eq(schema.role.organizationId, id)),
  })

  if (!existing) {
    return NextResponse.json({ error: 'Role not found' }, { status: 404 })
  }

  if (existing.isSystem) {
    return NextResponse.json(
      { error: 'System roles cannot be deleted' },
      { status: 400 },
    )
  }

  // Check if any memberships or invitations reference this role
  const membershipCount = await db.query.membership.findFirst({
    where: eq(schema.membership.roleId, roleId),
  })

  if (membershipCount) {
    return NextResponse.json(
      {
        error:
          'Cannot delete this role because members are still assigned to it',
      },
      { status: 400 },
    )
  }

  const invitationRef = await db.query.invitation.findFirst({
    where: eq(schema.invitation.roleId, roleId),
  })

  if (invitationRef) {
    return NextResponse.json(
      {
        error: 'Cannot delete this role because invitations still reference it',
      },
      { status: 400 },
    )
  }

  await db.delete(schema.role).where(eq(schema.role.id, roleId))

  await logAudit(db, {
    organizationId: id,
    actorId: session.user.id,
    action: 'role.deleted',
    entityType: 'role',
    entityId: roleId,
    payload: { name: existing.name },
  })

  return NextResponse.json({ success: true })
}
