import { createDb, schema, sql } from '@app/db'
import { tool } from 'ai'
import { z } from 'zod'

/**
 * Create a tool that suggests product changes (create, update, update_field).
 * Inserts a row into the suggestion table with targetType: 'product'.
 */
export function createSuggestProductTool(triggerRunId: string) {
  const db = createDb()

  return tool({
    description:
      'Suggest a product change. Use action "create" for new products, "update_field" for changing a specific field on an existing product, or "update" for bulk data updates. Only suggest changes for actual database columns: name, description, price, unit, category, status. Do NOT suggest changes targeting the "data" JSON column.',
    inputSchema: z.object({
      organizationId: z
        .string()
        .describe('The organization this product belongs to'),
      action: z
        .enum(['create', 'update', 'update_field'])
        .describe('The type of change being suggested'),
      productId: z
        .string()
        .nullable()
        .describe(
          'The existing product ID (null for create, required for update/update_field)',
        ),
      field: z
        .enum(['name', 'description', 'price', 'unit', 'category', 'status'])
        .describe(
          'Column name being changed. Must be an actual database column.',
        ),
      label: z
        .string()
        .describe(
          'Human-readable summary (e.g. "New product: Acme Sauce 500ml")',
        ),
      currentValue: z
        .unknown()
        .nullable()
        .describe('Current value snapshot for diff display'),
      proposedValue: z.unknown().describe('The proposed new value'),
      confidence: z
        .enum(['high', 'medium', 'low'])
        .nullable()
        .describe('Agent self-assessment of confidence'),
      source: z
        .string()
        .nullable()
        .describe('URL or file ID that produced this suggestion'),
      reasoning: z
        .string()
        .nullable()
        .describe('AI explanation of how it determined this value'),
    }),
    execute: async ({
      organizationId,
      action,
      productId,
      field,
      label,
      currentValue,
      proposedValue,
      confidence,
      source,
      reasoning,
    }) => {
      const now = new Date()
      let targetId = productId ?? null

      // For create actions, insert a draft product alongside the suggestion
      if (action === 'create') {
        const proposed = (proposedValue ?? {}) as Record<string, unknown>

        // Duplicate check by articleNumber
        const data = (proposed.data ?? {}) as Record<string, unknown>
        const articleNumber = (data.articleNumber ?? proposed.articleNumber) as
          | string
          | undefined
        const gtin = ((data.unit as Record<string, unknown> | undefined)
          ?.gtin ??
          (proposed.unit as Record<string, unknown> | undefined)?.gtin) as
          | string
          | undefined

        if (articleNumber) {
          const [existing] = await db
            .select({ id: schema.product.id })
            .from(schema.product)
            .where(
              sql`${schema.product.organizationId} = ${organizationId} AND ${schema.product.data}->>'articleNumber' = ${articleNumber}`,
            )
            .limit(1)
          if (existing) {
            return JSON.stringify({
              error: `Product with articleNumber ${articleNumber} already exists`,
              existingProductId: existing.id,
            })
          }
        }

        if (gtin) {
          const [existing] = await db
            .select({ id: schema.product.id })
            .from(schema.product)
            .where(
              sql`${schema.product.organizationId} = ${organizationId} AND ${schema.product.data}->'unit'->>'gtin' = ${gtin}`,
            )
            .limit(1)
          if (existing) {
            return JSON.stringify({
              error: `Product with GTIN ${gtin} already exists`,
              existingProductId: existing.id,
            })
          }
        }

        // Extract top-level columns from proposedValue
        const name = (proposed.name as string) ?? 'Unnamed Product'
        const description = (proposed.description as string) ?? null
        const price = (proposed.price as string) ?? null
        const unit = (proposed.unit as string) ?? null
        const category = (proposed.category as string) ?? null

        // Everything else goes into data
        const {
          name: _n,
          description: _d,
          price: _p,
          unit: _u,
          category: _c,
          ...rest
        } = proposed
        const productData =
          Object.keys(rest).length > 0 ? (rest.data ? rest.data : rest) : null

        const [draftProduct] = await db
          .insert(schema.product)
          .values({
            organizationId,
            name,
            description,
            price,
            unit: typeof unit === 'string' ? unit : null,
            category,
            data: productData,
            status: 'draft',
            currentVersionId: null,
            createdAt: now,
            updatedAt: now,
          })
          .returning({ id: schema.product.id })

        targetId = draftProduct.id
      }

      const inserted = await db
        .insert(schema.suggestion)
        .values({
          organizationId,
          targetType: 'product',
          targetId,
          action,
          field,
          label,
          currentValue: currentValue ?? null,
          proposedValue,
          confidence: confidence ?? null,
          source: source ?? null,
          reasoning: reasoning ?? null,
          triggerRunId,
          createdAt: now,
          updatedAt: now,
        })
        .returning({ id: schema.suggestion.id })

      return JSON.stringify({
        suggestionId: inserted[0].id,
        created: true,
        ...(targetId && action === 'create' ? { productId: targetId } : {}),
      })
    },
  })
}

/**
 * Create a tool that suggests organization changes (update, update_field).
 * Inserts a row into the suggestion table with targetType: 'organization'.
 */
export function createSuggestOrganizationTool(triggerRunId: string) {
  const db = createDb()

  return tool({
    description:
      'Suggest an organization data change. Use action "update_field" for changing a specific field, or "update" for bulk updates. Only suggest changes for actual database columns: name, description, phone, email, address, deliveryAddress, deliveryAreas, logoUrl. Do NOT suggest changes targeting the "data" JSON column.',
    inputSchema: z.object({
      organizationId: z.string().describe('The organization ID'),
      action: z
        .enum(['update', 'update_field'])
        .describe('The type of change being suggested'),
      field: z
        .enum([
          'name',
          'description',
          'phone',
          'email',
          'address',
          'deliveryAddress',
          'deliveryAreas',
          'logoUrl',
        ])
        .describe(
          'Column name being changed. Must be an actual database column.',
        ),
      label: z
        .string()
        .describe(
          'Human-readable summary (e.g. "Update phone: +31 6 12345678")',
        ),
      currentValue: z
        .unknown()
        .nullable()
        .describe('Current value snapshot for diff display'),
      proposedValue: z.unknown().describe('The proposed new value'),
      confidence: z
        .enum(['high', 'medium', 'low'])
        .nullable()
        .describe('Agent self-assessment of confidence'),
      source: z
        .string()
        .nullable()
        .describe('URL or file ID that produced this suggestion'),
      reasoning: z
        .string()
        .nullable()
        .describe('AI explanation of how it determined this value'),
    }),
    execute: async ({
      organizationId,
      action,
      field,
      label,
      currentValue,
      proposedValue,
      confidence,
      source,
      reasoning,
    }) => {
      const now = new Date()
      const inserted = await db
        .insert(schema.suggestion)
        .values({
          organizationId,
          targetType: 'organization',
          targetId: organizationId,
          action,
          field,
          label,
          currentValue: currentValue ?? null,
          proposedValue,
          confidence: confidence ?? null,
          source: source ?? null,
          reasoning: reasoning ?? null,
          triggerRunId,
          createdAt: now,
          updatedAt: now,
        })
        .returning({ id: schema.suggestion.id })

      return JSON.stringify({ suggestionId: inserted[0].id, created: true })
    },
  })
}
