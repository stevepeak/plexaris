import { and, createDb, eq, isNull, schema } from '@app/db'
import { NextResponse } from 'next/server'

import { auth } from '@/lib/auth'

const db = createDb()

// GET /api/claim/[token] — Preview the organization to be claimed (no auth required)
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params

  const [claim] = await db
    .select()
    .from(schema.claimToken)
    .where(
      and(eq(schema.claimToken.token, token), isNull(schema.claimToken.usedAt)),
    )
    .limit(1)

  if (!claim) {
    return NextResponse.json(
      { error: 'Claim token not found or already used' },
      { status: 404 },
    )
  }

  if (claim.expiresAt < new Date()) {
    return NextResponse.json(
      { error: 'Claim token has expired' },
      { status: 410 },
    )
  }

  const organization = await db.query.organization.findFirst({
    where: eq(schema.organization.id, claim.organizationId),
  })

  if (!organization) {
    return NextResponse.json(
      { error: 'Organization not found' },
      { status: 404 },
    )
  }

  return NextResponse.json({
    organization: {
      id: organization.id,
      name: organization.name,
      type: organization.type,
      claimed: organization.claimed,
      description: organization.description,
      logoUrl: organization.logoUrl,
      phone: organization.phone,
      email: organization.email,
      address: organization.address,
    },
    claimEmail: claim.email,
  })
}

// POST /api/claim/[token] — Claim the organization (auth required)
export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const session = await auth.api.getSession({
    headers: request.headers,
  })

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { token } = await params

  const [claim] = await db
    .select()
    .from(schema.claimToken)
    .where(
      and(eq(schema.claimToken.token, token), isNull(schema.claimToken.usedAt)),
    )
    .limit(1)

  if (!claim) {
    return NextResponse.json(
      { error: 'Claim token not found or already used' },
      { status: 404 },
    )
  }

  if (claim.expiresAt < new Date()) {
    return NextResponse.json(
      { error: 'Claim token has expired' },
      { status: 410 },
    )
  }

  const organization = await db.query.organization.findFirst({
    where: eq(schema.organization.id, claim.organizationId),
  })

  if (!organization) {
    return NextResponse.json(
      { error: 'Organization not found' },
      { status: 404 },
    )
  }

  if (organization.claimed) {
    return NextResponse.json(
      { error: 'Organization has already been claimed' },
      { status: 409 },
    )
  }

  const now = new Date()

  // Create membership — claiming user becomes owner
  await db.insert(schema.membership).values({
    userId: session.user.id,
    organizationId: organization.id,
    role: 'owner',
    createdAt: now,
    updatedAt: now,
  })

  // Mark token as used
  await db
    .update(schema.claimToken)
    .set({ usedAt: now })
    .where(eq(schema.claimToken.id, claim.id))

  // Update organization to claimed
  await db
    .update(schema.organization)
    .set({ claimed: true, updatedAt: now })
    .where(eq(schema.organization.id, organization.id))

  const updatedOrg = await db.query.organization.findFirst({
    where: eq(schema.organization.id, organization.id),
  })

  return NextResponse.json({ organization: updatedOrg, success: true })
}
