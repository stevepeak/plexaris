import { createDb, schema } from '@app/db'
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
      const inserted = await db
        .insert(schema.suggestion)
        .values({
          organizationId,
          targetType: 'product',
          targetId: productId ?? null,
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
