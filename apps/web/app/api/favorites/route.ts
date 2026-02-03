import { and, createDb, eq, inArray, schema } from '@app/db'
import { NextResponse } from 'next/server'

import { auth } from '@/lib/auth'

const db = createDb()

export async function POST(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  })

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { organizationId, targetType, targetId } = body as {
    organizationId: string
    targetType: 'product' | 'supplier' | 'recipe'
    targetId: string
  }

  // Verify the user belongs to this organization
  const membership = await db
    .select({ id: schema.membership.id })
    .from(schema.membership)
    .where(
      and(
        eq(schema.membership.userId, session.user.id),
        eq(schema.membership.organizationId, organizationId),
      ),
    )
    .limit(1)

  if (membership.length === 0) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Check if favorite exists
  const existing = await db
    .select({ id: schema.favorite.id })
    .from(schema.favorite)
    .where(
      and(
        eq(schema.favorite.organizationId, organizationId),
        eq(schema.favorite.targetType, targetType),
        eq(schema.favorite.targetId, targetId),
      ),
    )
    .limit(1)

  if (existing.length > 0) {
    await db
      .delete(schema.favorite)
      .where(eq(schema.favorite.id, existing[0]!.id))
    return NextResponse.json({ favorited: false })
  }

  await db.insert(schema.favorite).values({
    organizationId,
    targetType,
    targetId,
    createdAt: new Date(),
  })

  return NextResponse.json({ favorited: true })
}

export async function GET(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  })

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const organizationId = searchParams.get('organizationId')
  const targetType = searchParams.get('targetType') as
    | 'product'
    | 'supplier'
    | 'recipe'
    | null

  if (!organizationId) {
    return NextResponse.json(
      { error: 'organizationId required' },
      { status: 400 },
    )
  }

  const conditions = [eq(schema.favorite.organizationId, organizationId)]
  if (targetType) {
    conditions.push(eq(schema.favorite.targetType, targetType))
  }

  const favorites = await db
    .select()
    .from(schema.favorite)
    .where(and(...conditions))
    .orderBy(schema.favorite.createdAt)

  // Gather product and supplier details for the favorites
  const productIds = favorites
    .filter((f) => f.targetType === 'product')
    .map((f) => f.targetId)
  const supplierIds = favorites
    .filter((f) => f.targetType === 'supplier')
    .map((f) => f.targetId)

  // Fetch product details with their supplier (organization) info
  const productRows =
    productIds.length > 0
      ? await db
          .select({
            id: schema.product.id,
            name: schema.product.name,
            description: schema.product.description,
            price: schema.product.price,
            unit: schema.product.unit,
            category: schema.product.category,
            supplierId: schema.organization.id,
            supplierName: schema.organization.name,
          })
          .from(schema.product)
          .innerJoin(
            schema.organization,
            eq(schema.product.organizationId, schema.organization.id),
          )
          .where(inArray(schema.product.id, productIds))
      : []

  // Fetch supplier details
  const supplierRows =
    supplierIds.length > 0
      ? await db
          .select({
            id: schema.organization.id,
            name: schema.organization.name,
            description: schema.organization.description,
          })
          .from(schema.organization)
          .where(inArray(schema.organization.id, supplierIds))
      : []

  const products = productRows.map((row) => ({
    id: row.id,
    name: row.name,
    description: row.description,
    price: row.price,
    unit: row.unit,
    category: row.category,
    supplier: { id: row.supplierId, name: row.supplierName },
    isFavorited: true as const,
    favoriteType: 'product' as const,
  }))

  const suppliers = supplierRows.map((row) => ({
    id: row.id,
    name: row.name,
    description: row.description,
    price: null,
    unit: null,
    category: null,
    supplier: { id: row.id, name: row.name },
    isFavorited: true as const,
    favoriteType: 'supplier' as const,
  }))

  return NextResponse.json({ favorites: [...products, ...suppliers] })
}
