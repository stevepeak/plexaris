import { trackEvent } from '@app/api'
import { getConfig } from '@app/config'
import { and, createDb, eq, isNull, schema } from '@app/db'
import { type Locale, UserInviteEmail } from '@app/email'
import { sendEmail } from '@app/resend'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createElement } from 'react'

import { auth } from '@/lib/auth'
import { checkPermission } from '@/lib/permissions'

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
  const { email, organizationId, roleId } = body

  if (!email || !organizationId || !roleId) {
    return NextResponse.json(
      { error: 'Email, organizationId, and roleId are required' },
      { status: 400 },
    )
  }

  // Verify the user has invite_members permission
  const perm = await checkPermission(
    session.user.id,
    organizationId,
    'invite_members',
  )

  if (!perm) {
    return NextResponse.json(
      { error: 'You do not have permission to invite members' },
      { status: 403 },
    )
  }

  // Verify the roleId belongs to this org
  const targetRole = await db.query.role.findFirst({
    where: and(
      eq(schema.role.id, roleId),
      eq(schema.role.organizationId, organizationId),
    ),
  })

  if (!targetRole) {
    return NextResponse.json(
      { error: 'Invalid role for this organization' },
      { status: 400 },
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

  const [invitation] = await db
    .insert(schema.invitation)
    .values({
      organizationId,
      invitedBy: session.user.id,
      email,
      roleId,
      token: crypto.randomUUID(),
      expiresAt,
      createdAt: now,
    })
    .returning()

  // Send invitation email (best-effort — don't fail the invite if email fails)
  try {
    const org = await db.query.organization.findFirst({
      where: eq(schema.organization.id, organizationId),
    })

    const baseURL = getConfig().BETTER_AUTH_BASE_URL
    const cookieStore = await cookies()
    const locale: Locale =
      cookieStore.get('locale')?.value === 'nl' ? 'nl' : 'en'
    await sendEmail(
      email,
      `You've been invited to join ${org?.name ?? 'an organization'}`,
      createElement(UserInviteEmail, {
        invitedByName: session.user.name,
        organizationName: org?.name ?? 'an organization',
        inviteLink: `${baseURL}/dashboard`,
        roleName: targetRole.name,
        locale,
      }),
    )
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Failed to send invitation email:', e)
  }

  await trackEvent(db, {
    organizationId,
    actorId: session.user.id,
    action: 'member.invited',
    entityType: 'invitation',
    entityId: invitation!.id,
    payload: { email, roleName: targetRole.name },
  })

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
      roleName: schema.role.name,
      createdAt: schema.invitation.createdAt,
      expiresAt: schema.invitation.expiresAt,
      acceptedAt: schema.invitation.acceptedAt,
      rejectedAt: schema.invitation.rejectedAt,
      invitedByName: schema.user.name,
    })
    .from(schema.invitation)
    .innerJoin(schema.user, eq(schema.invitation.invitedBy, schema.user.id))
    .innerJoin(schema.role, eq(schema.invitation.roleId, schema.role.id))
    .where(eq(schema.invitation.organizationId, organizationId))

  return NextResponse.json({ invitations })
}
