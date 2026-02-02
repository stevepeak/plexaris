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
  const { organizationId, name, description, price, unit, category, images } =
    body

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
  const productId = crypto.randomUUID()

  await db.insert(schema.product).values({
    id: productId,
    organizationId,
    name: name.trim(),
    description: description || null,
    price: price != null ? String(price) : null,
    unit: unit || null,
    category: category || null,
    status: 'draft',
    images: images || [],
    createdAt: now,
    updatedAt: now,
  })

  const product = await db.query.product.findFirst({
    where: eq(schema.product.id, productId),
  })

  return NextResponse.json({ product }, { status: 201 })
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
