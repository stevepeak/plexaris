import { and, createDb, eq, isNull, schema } from '@app/db'
import { NextResponse } from 'next/server'

import { auth } from '@/lib/auth'

const db = createDb()

// POST /api/invitations — Create an invitation
export async function POST(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  })

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { email, organizationId, role } = body

  if (!email || !organizationId) {
    return NextResponse.json(
      { error: 'Email and organizationId are required' },
      { status: 400 },
    )
  }

  const inviteRole = role === 'owner' ? 'owner' : 'member'

  // Verify the user is an owner of the org
  const membership = await db.query.membership.findFirst({
    where: and(
      eq(schema.membership.userId, session.user.id),
      eq(schema.membership.organizationId, organizationId),
      eq(schema.membership.role, 'owner'),
    ),
  })

  if (!membership) {
    return NextResponse.json(
      { error: 'Only organization owners can invite members' },
      { status: 403 },
    )
  }

  // Check if user is already a member
  const existingUser = await db.query.user.findFirst({
    where: eq(schema.user.email, email),
  })

  if (existingUser) {
    const existingMembership = await db.query.membership.findFirst({
      where: and(
        eq(schema.membership.userId, existingUser.id),
        eq(schema.membership.organizationId, organizationId),
      ),
    })
    if (existingMembership) {
      return NextResponse.json(
        { error: 'User is already a member of this organization' },
        { status: 409 },
      )
    }
  }

  // Check for existing pending invitation
  const existingInvite = await db.query.invitation.findFirst({
    where: and(
      eq(schema.invitation.email, email),
      eq(schema.invitation.organizationId, organizationId),
      isNull(schema.invitation.acceptedAt),
      isNull(schema.invitation.rejectedAt),
    ),
  })

  if (existingInvite) {
    return NextResponse.json(
      { error: 'An invitation has already been sent to this email' },
      { status: 409 },
    )
  }

  const now = new Date()
  const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) // 7 days

  const invitation = {
    id: crypto.randomUUID(),
    organizationId,
    invitedBy: session.user.id,
    email,
    role: inviteRole,
    token: crypto.randomUUID(),
    expiresAt,
    createdAt: now,
  }

  await db.insert(schema.invitation).values(invitation)

  return NextResponse.json({ invitation }, { status: 201 })
}

// GET /api/invitations?organizationId=xxx — List invitations for an org
export async function GET(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  })

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const organizationId = searchParams.get('organizationId')

  if (!organizationId) {
    return NextResponse.json(
      { error: 'organizationId is required' },
      { status: 400 },
    )
  }

  // Verify the user is a member of the org
  const membership = await db.query.membership.findFirst({
    where: and(
      eq(schema.membership.userId, session.user.id),
      eq(schema.membership.organizationId, organizationId),
    ),
  })

  if (!membership) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const invitations = await db
    .select({
      id: schema.invitation.id,
      email: schema.invitation.email,
      role: schema.invitation.role,
      createdAt: schema.invitation.createdAt,
      expiresAt: schema.invitation.expiresAt,
      acceptedAt: schema.invitation.acceptedAt,
      rejectedAt: schema.invitation.rejectedAt,
      invitedByName: schema.user.name,
    })
    .from(schema.invitation)
    .innerJoin(schema.user, eq(schema.invitation.invitedBy, schema.user.id))
    .where(eq(schema.invitation.organizationId, organizationId))

  return NextResponse.json({ invitations })
}
