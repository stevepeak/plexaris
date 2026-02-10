import { and, createDb, eq, isNotNull, isNull, schema } from '@app/db'
import { NextResponse } from 'next/server'

import { auth } from '@/lib/auth'

const db = createDb()

// POST /api/products — Create a new product
export async function POST(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  })

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const {
    organizationId,
    name,
    description,
    price,
    unit,
    category,
    images,
    data,
  } = body

  if (!organizationId || !name || typeof name !== 'string' || !name.trim()) {
    return NextResponse.json(
      { error: 'organizationId and name are required' },
      { status: 400 },
    )
  }

  // Verify user is an owner of the organization
  const membership = await db.query.membership.findFirst({
    where: and(
      eq(schema.membership.userId, session.user.id),
      eq(schema.membership.organizationId, organizationId),
      eq(schema.membership.role, 'owner'),
    ),
  })

  if (!membership) {
    return NextResponse.json(
      { error: 'Only organization owners can create products' },
      { status: 403 },
    )
  }

  const now = new Date()

  const [product] = await db
    .insert(schema.product)
    .values({
      organizationId,
      name: name.trim(),
      description: description || null,
      price: price != null ? String(price) : null,
      unit: unit || null,
      category: category || null,
      status: 'draft',
      images: images || [],
      data: data || null,
      createdAt: now,
      updatedAt: now,
    })
    .returning()

  // Insert version 1
  const [version] = await db
    .insert(schema.productVersion)
    .values({
      productId: product.id,
      version: 1,
      name: product.name,
      description: product.description,
      price: product.price,
      unit: product.unit,
      category: product.category,
      images: product.images,
      data: product.data,
      editedBy: session.user.id,
      createdAt: now,
    })
    .returning({ id: schema.productVersion.id })

  await db
    .update(schema.product)
    .set({ currentVersionId: version.id })
    .where(eq(schema.product.id, product.id))

  return NextResponse.json(
    { product: { ...product, currentVersionId: version.id } },
    { status: 201 },
  )
}

// GET /api/products?organizationId= — List products for an organization
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const organizationId = searchParams.get('organizationId')

  if (!organizationId) {
    return NextResponse.json(
      { error: 'organizationId query parameter is required' },
      { status: 400 },
    )
  }

  // Verify the organization exists
  const org = await db.query.organization.findFirst({
    where: eq(schema.organization.id, organizationId),
  })

  if (!org) {
    return NextResponse.json(
      { error: 'Organization not found' },
      { status: 404 },
    )
  }

  const showArchived = searchParams.get('archived') === 'true'

  const products = await db.query.product.findMany({
    where: and(
      eq(schema.product.organizationId, organizationId),
      showArchived
        ? isNotNull(schema.product.archivedAt)
        : isNull(schema.product.archivedAt),
    ),
    orderBy: (product, { desc }) => [desc(product.createdAt)],
  })

  return NextResponse.json({ products })
}
