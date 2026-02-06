import { createDb, type DB, eq, schema, sql } from '@app/db'
import { tool } from 'ai'
import { z } from 'zod'

/**
 * Tool that provides typed database helpers for common operations
 * the scraping agents need: fetch/update organizations and products.
 */
export function createQueryDatabaseTool() {
  const db = createDb()

  return tool({
    name: 'queryDatabase',
    description: `Query the database. Supported operations:
- getOrganization: Fetch an organization by ID. Params: { id }
- updateOrganizationData: Update the data jsonb column on an organization. Params: { id, data }
- getProduct: Fetch a product by ID. Params: { id }
- findProductByArticleNumber: Find a product by article number across all orgs. Params: { articleNumber }
- findProductByGtin: Find a product by GTIN/EAN code across all orgs. Params: { gtin }
- upsertProduct: Insert a new product. Params: { organizationId, name, description?, price?, unit?, category?, data? }
- updateProductData: Update the data jsonb column on a product. Params: { id, data }`,
    inputSchema: z.object({
      operation: z.enum([
        'getOrganization',
        'updateOrganizationData',
        'getProduct',
        'findProductByArticleNumber',
        'findProductByGtin',
        'upsertProduct',
        'updateProductData',
      ]),
      params: z
        .record(z.unknown())
        .describe('Parameters for the operation (varies by operation)'),
    }),
    execute: async ({ operation, params }) => {
      let result: unknown
      switch (operation) {
        case 'getOrganization':
          result = await getOrganization(db, params as { id: string })
          break
        case 'updateOrganizationData':
          result = await updateOrganizationData(
            db,
            params as { id: string; data: Record<string, unknown> },
          )
          break
        case 'getProduct':
          result = await getProduct(db, params as { id: string })
          break
        case 'findProductByArticleNumber':
          result = await findProductByArticleNumber(
            db,
            params as { articleNumber: string },
          )
          break
        case 'findProductByGtin':
          result = await findProductByGtin(db, params as { gtin: string })
          break
        case 'upsertProduct':
          result = await upsertProduct(
            db,
            params as {
              organizationId: string
              name: string
              description?: string
              price?: string
              unit?: string
              category?: string
              data?: Record<string, unknown>
            },
          )
          break
        case 'updateProductData':
          result = await updateProductData(
            db,
            params as { id: string; data: Record<string, unknown> },
          )
          break
        default:
          result = { error: `Unknown operation: ${operation}` }
      }
      return JSON.stringify(result)
    },
  })
}

async function getOrganization(db: DB, params: { id: string }) {
  const rows = await db
    .select()
    .from(schema.organization)
    .where(eq(schema.organization.id, params.id))
    .limit(1)
  return rows[0] ?? { error: 'Organization not found' }
}

async function updateOrganizationData(
  db: DB,
  params: { id: string; data: Record<string, unknown> },
) {
  const now = new Date()
  await db
    .update(schema.organization)
    .set({ data: params.data, updatedAt: now })
    .where(eq(schema.organization.id, params.id))
  return { success: true }
}

async function getProduct(db: DB, params: { id: string }) {
  const rows = await db
    .select()
    .from(schema.product)
    .where(eq(schema.product.id, params.id))
    .limit(1)
  return rows[0] ?? { error: 'Product not found' }
}

async function findProductByArticleNumber(
  db: DB,
  params: { articleNumber: string },
) {
  const rows = await db
    .select()
    .from(schema.product)
    .where(
      sql`${schema.product.data}->>'articleNumber' = ${params.articleNumber}`,
    )
    .limit(1)
  return rows[0] ?? null
}

async function findProductByGtin(db: DB, params: { gtin: string }) {
  const rows = await db
    .select()
    .from(schema.product)
    .where(sql`${schema.product.data}->'unit'->>'gtin' = ${params.gtin}`)
    .limit(1)
  return rows[0] ?? null
}

async function upsertProduct(
  db: DB,
  params: {
    organizationId: string
    name: string
    description?: string
    price?: string
    unit?: string
    category?: string
    data?: Record<string, unknown>
  },
) {
  const now = new Date()
  const inserted = await db
    .insert(schema.product)
    .values({
      organizationId: params.organizationId,
      name: params.name,
      description: params.description ?? null,
      price: params.price ?? null,
      unit: params.unit ?? null,
      category: params.category ?? null,
      data: params.data ?? null,
      status: 'active',
      createdAt: now,
      updatedAt: now,
    })
    .returning({ id: schema.product.id })
  return { id: inserted[0].id, created: true }
}

async function updateProductData(
  db: DB,
  params: { id: string; data: Record<string, unknown> },
) {
  const now = new Date()
  await db
    .update(schema.product)
    .set({ data: params.data, updatedAt: now })
    .where(eq(schema.product.id, params.id))
  return { success: true }
}
