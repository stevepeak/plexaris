import { and, createDb, eq, schema, sql } from '@app/db'
import { NextResponse } from 'next/server'

import { auth } from '@/lib/auth'

const db = createDb()

// GET /api/products/[id] — Get product detail with supplier info
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params

  const rows = await db
    .select({
      id: schema.product.id,
      name: schema.product.name,
      description: schema.product.description,
      price: schema.product.price,
      unit: schema.product.unit,
      category: schema.product.category,
      status: schema.product.status,
      images: schema.product.images,
      data: schema.product.data,
      organizationId: schema.product.organizationId,
      createdAt: schema.product.createdAt,
      updatedAt: schema.product.updatedAt,
      supplierId: schema.organization.id,
      supplierName: schema.organization.name,
    })
    .from(schema.product)
    .innerJoin(
      schema.organization,
      eq(schema.product.organizationId, schema.organization.id),
    )
    .where(eq(schema.product.id, id))
    .limit(1)

  const row = rows[0]
  if (!row) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  }

  return NextResponse.json({
    product: {
      id: row.id,
      name: row.name,
      description: row.description,
      price: row.price,
      unit: row.unit,
      category: row.category,
      status: row.status,
      images: row.images,
      data: row.data,
      organizationId: row.organizationId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      supplier: { id: row.supplierId, name: row.supplierName },
    },
  })
}

// PATCH /api/products/[id] — Update a product
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
      { error: 'Only organization owners can update products' },
      { status: 403 },
    )
  }

  const body = await request.json()
  const {
    name,
    description,
    price,
    unit,
    category,
    status,
    images,
    data,
    note,
  } = body

  const now = new Date()

  // Merge data blob: spread existing + new so partial section updates work
  let mergedData = existing.data
  if (data !== undefined) {
    mergedData = { ...(existing.data as Record<string, unknown>), ...data }
  }

  await db
    .update(schema.product)
    .set({
      ...(name !== undefined && { name: name.trim() }),
      ...(description !== undefined && { description: description || null }),
      ...(price !== undefined && {
        price: price != null ? String(price) : null,
      }),
      ...(unit !== undefined && { unit: unit || null }),
      ...(category !== undefined && { category: category || null }),
      ...(status !== undefined && { status }),
      ...(images !== undefined && { images }),
      ...(data !== undefined && { data: mergedData }),
      updatedAt: now,
    })
    .where(eq(schema.product.id, id))

  const product = await db.query.product.findFirst({
    where: eq(schema.product.id, id),
  })

  if (product) {
    // Compute next version number
    const [maxRow] = await db
      .select({
        maxVersion: sql<number>`COALESCE(MAX(${schema.productVersion.version}), 0)`,
      })
      .from(schema.productVersion)
      .where(eq(schema.productVersion.productId, id))

    const nextVersion = (maxRow?.maxVersion ?? 0) + 1

    const [version] = await db
      .insert(schema.productVersion)
      .values({
        productId: id,
        version: nextVersion,
        name: product.name,
        description: product.description,
        price: product.price,
        unit: product.unit,
        category: product.category,
        images: product.images,
        data: product.data,
        editedBy: session.user.id,
        note: note || null,
        createdAt: now,
      })
      .returning({ id: schema.productVersion.id })

    await db
      .update(schema.product)
      .set({ currentVersionId: version.id })
      .where(eq(schema.product.id, id))
  }

  // Auto-accept linked suggestion when a draft product is activated
  if (existing.status === 'draft' && status === 'active') {
    await db
      .update(schema.suggestion)
      .set({
        status: 'accepted',
        reviewedBy: session.user.id,
        reviewedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(schema.suggestion.targetId, id),
          eq(schema.suggestion.targetType, 'product'),
          eq(schema.suggestion.action, 'create'),
          eq(schema.suggestion.status, 'pending'),
        ),
      )
  }

  return NextResponse.json({ product })
}
