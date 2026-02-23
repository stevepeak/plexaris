import { and, createDb, eq, ilike, isNull, or, schema } from '@app/db'
import { NextResponse } from 'next/server'

import { auth } from '@/lib/auth'

const db = createDb()

export async function GET(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  })

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search')
  const category = searchParams.get('category')
  const organizationId = searchParams.get('organizationId')
  const favoritesOrgId = searchParams.get('favoritesOrgId')

  const conditions = [
    isNull(schema.product.archivedAt),
    isNull(schema.organization.archivedAt),
    eq(schema.organization.type, 'supplier'),
  ]

  if (category && category !== 'All products' && category !== 'Supplier') {
    if (category.includes(' > ')) {
      // Sub-category: exact match
      conditions.push(eq(schema.product.category, category))
    } else {
      // Primary category: match exact or any sub-category
      conditions.push(
        or(
          eq(schema.product.category, category),
          ilike(schema.product.category, `${category} > %`),
        )!,
      )
    }
  }

  if (organizationId) {
    conditions.push(eq(schema.product.organizationId, organizationId))
  }

  if (search) {
    const pattern = `%${search}%`
    conditions.push(
      or(
        ilike(schema.product.name, pattern),
        ilike(schema.product.description, pattern),
      )!,
    )
  }

  // Fetch favorite product IDs for the org if requested
  let favoriteIds: Set<string> | null = null
  if (favoritesOrgId) {
    const favRows = await db
      .select({ targetId: schema.favorite.targetId })
      .from(schema.favorite)
      .where(
        and(
          eq(schema.favorite.organizationId, favoritesOrgId),
          eq(schema.favorite.targetType, 'product'),
        ),
      )
    favoriteIds = new Set(favRows.map((r) => r.targetId))
  }

  const rows = await db
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
    .where(and(...conditions))
    .orderBy(schema.product.name)

  const products = rows.map((row) => ({
    id: row.id,
    name: row.name,
    description: row.description,
    price: row.price,
    unit: row.unit,
    category: row.category,
    supplier: { id: row.supplierId, name: row.supplierName },
    ...(favoriteIds ? { isFavorited: favoriteIds.has(row.id) } : {}),
  }))

  return NextResponse.json({ products })
}
