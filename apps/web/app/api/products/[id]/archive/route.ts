import { and, createDb, eq, schema } from '@app/db'
import { NextResponse } from 'next/server'

import { auth } from '@/lib/auth'

const db = createDb()

// POST /api/products/[id]/archive — Archive or restore a product
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

  const existing = await db.query.product.findFirst({
    where: eq(schema.product.id, id),
  })

  if (!existing) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  }

  // Verify user is an owner of the product's organization
  const membership = await db.query.membership.findFirst({
    where: and(
      eq(schema.membership.userId, session.user.id),
      eq(schema.membership.organizationId, existing.organizationId),
      eq(schema.membership.role, 'owner'),
    ),
  })

  if (!membership) {
    return NextResponse.json(
      { error: 'Only organization owners can archive products' },
      { status: 403 },
    )
  }

  const now = new Date()
  const isArchived = existing.archivedAt !== null

  await db
    .update(schema.product)
    .set({
      status: isArchived ? 'draft' : 'archived',
      archivedAt: isArchived ? null : now,
      updatedAt: now,
    })
    .where(eq(schema.product.id, id))

  const product = await db.query.product.findFirst({
    where: eq(schema.product.id, id),
  })

  return NextResponse.json({ product })
}
