import { and, count, createDb, eq, schema } from '@app/db'
import { NextResponse } from 'next/server'

import { auth } from '@/lib/auth'
import { checkMembership } from '@/lib/permissions'

const db = createDb()

// POST /api/organizations/[id]/leave — Leave an organization
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

  const member = await checkMembership(session.user.id, id)

  if (!member) {
    return NextResponse.json(
      { error: 'You are not a member of this organization' },
      { status: 403 },
    )
  }

  // Sole admins cannot leave — they must assign another admin or archive the org
  if (member.isSystem) {
    const [{ value: adminCount }] = await db
      .select({ value: count() })
      .from(schema.membership)
      .innerJoin(schema.role, eq(schema.membership.roleId, schema.role.id))
      .where(
        and(
          eq(schema.membership.organizationId, id),
          eq(schema.role.isSystem, true),
        ),
      )

    if (adminCount <= 1) {
      return NextResponse.json(
        {
          error:
            "You're the sole admin. Assign another admin or archive the organization first.",
        },
        { status: 400 },
      )
    }
  }

  // Delete the membership
  await db
    .delete(schema.membership)
    .where(eq(schema.membership.id, member.membershipId))

  return NextResponse.json({ success: true })
}
