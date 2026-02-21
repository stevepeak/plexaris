import { and, createDb, eq, schema } from '@app/db'
import { NextResponse } from 'next/server'

import { auth } from '@/lib/auth'
import { checkPermission } from '@/lib/permissions'

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

  const perm = await checkPermission(
    session.user.id,
    existing.organizationId,
    'manage_products',
  )

  if (!perm) {
    return NextResponse.json(
      { error: 'You do not have permission to manage products' },
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
