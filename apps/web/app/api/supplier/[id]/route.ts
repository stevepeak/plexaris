import { createDb, eq, schema } from '@app/db'
import { NextResponse } from 'next/server'

const db = createDb()

// GET /api/supplier/[id] — Public read-only supplier profile (no auth required)
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params

  const organization = await db.query.organization.findFirst({
    where: eq(schema.organization.id, id),
  })

  if (!organization) {
    return NextResponse.json({ error: 'Supplier not found' }, { status: 404 })
  }

  if (organization.type !== 'supplier') {
    return NextResponse.json({ error: 'Supplier not found' }, { status: 404 })
  }

  return NextResponse.json({
    supplier: {
      id: organization.id,
      name: organization.name,
      type: organization.type,
      status: organization.status,
      description: organization.description,
      logoUrl: organization.logoUrl,
      phone: organization.phone,
      email: organization.email,
      address: organization.address,
    },
  })
}
