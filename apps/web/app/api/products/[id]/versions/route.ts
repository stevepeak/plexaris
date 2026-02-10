import { createDb, desc, eq, schema } from '@app/db'
import { NextResponse } from 'next/server'

const db = createDb()

// GET /api/products/[id]/versions — List version history for a product
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params

  const existing = await db.query.product.findFirst({
    where: eq(schema.product.id, id),
    columns: { id: true },
  })

  if (!existing) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  }

  const rows = await db
    .select({
      id: schema.productVersion.id,
      version: schema.productVersion.version,
      name: schema.productVersion.name,
      description: schema.productVersion.description,
      price: schema.productVersion.price,
      unit: schema.productVersion.unit,
      category: schema.productVersion.category,
      images: schema.productVersion.images,
      note: schema.productVersion.note,
      createdAt: schema.productVersion.createdAt,
      editedById: schema.productVersion.editedBy,
      editedByName: schema.user.name,
    })
    .from(schema.productVersion)
    .innerJoin(schema.user, eq(schema.productVersion.editedBy, schema.user.id))
    .where(eq(schema.productVersion.productId, id))
    .orderBy(desc(schema.productVersion.version))

  const versions = rows.map((r) => ({
    id: r.id,
    version: r.version,
    name: r.name,
    description: r.description,
    price: r.price,
    unit: r.unit,
    category: r.category,
    images: r.images,
    note: r.note,
    createdAt: r.createdAt.toISOString(),
    editedBy: { id: r.editedById, name: r.editedByName },
  }))

  return NextResponse.json({ versions })
}
