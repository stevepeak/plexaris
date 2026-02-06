import { createDb, schema, sql } from '@app/db'
import { tool } from 'ai'
import { z } from 'zod'

/**
 * Search for an existing product by articleNumber or GTIN within an organization.
 */
export function createSearchProductTool() {
  const db = createDb()

  return tool({
    description:
      'Search for a product by articleNumber OR gtin within an organization. Returns the product row or null if not found.',
    inputSchema: z.object({
      organizationId: z.string().describe('The organization to search within'),
      articleNumber: z
        .string()
        .nullable()
        .describe('Article number to search for'),
      gtin: z.string().nullable().describe('GTIN/EAN code to search for'),
    }),
    execute: async ({ organizationId, articleNumber, gtin }) => {
      if (articleNumber) {
        const rows = await db
          .select()
          .from(schema.product)
          .where(
            sql`${schema.product.organizationId} = ${organizationId} AND ${schema.product.data}->>'articleNumber' = ${articleNumber}`,
          )
          .limit(1)
        if (rows[0]) return JSON.stringify(rows[0])
      }

      if (gtin) {
        const rows = await db
          .select()
          .from(schema.product)
          .where(
            sql`${schema.product.organizationId} = ${organizationId} AND ${schema.product.data}->'unit'->>'gtin' = ${gtin}`,
          )
          .limit(1)
        if (rows[0]) return JSON.stringify(rows[0])
      }

      return JSON.stringify(null)
    },
  })
}
