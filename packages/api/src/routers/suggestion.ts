import { and, count, desc, eq, schema, sql } from '@app/db'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'

import { trackEvent } from '../lib/audit'
import { verifyAccess } from '../lib/verify-access'
import { protectedProcedure, router } from '../trpc'

const PRODUCT_UPDATABLE_FIELDS = new Set([
  'name',
  'description',
  'price',
  'unit',
  'category',
  'images',
  'data',
])

const ORGANIZATION_UPDATABLE_FIELDS = new Set([
  'name',
  'description',
  'logoUrl',
  'phone',
  'email',
  'address',
  'deliveryAddress',
  'deliveryAreas',
  'data',
])

export const suggestionRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        organizationId: z.string().uuid(),
        status: z
          .enum(['pending', 'accepted', 'rejected', 'dismissed'])
          .optional(),
        targetType: z.enum(['product', 'organization']).optional(),
        triggerRunId: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      await verifyAccess(
        ctx.db,
        ctx.session.user.id,
        input.organizationId,
        ctx.session.user.superAdmin,
      )

      const conditions = [
        eq(schema.suggestion.organizationId, input.organizationId),
      ]

      if (input.status) {
        conditions.push(eq(schema.suggestion.status, input.status))
      }

      if (input.targetType) {
        conditions.push(eq(schema.suggestion.targetType, input.targetType))
      }

      if (input.triggerRunId) {
        conditions.push(eq(schema.suggestion.triggerRunId, input.triggerRunId))
      }

      const suggestions = await ctx.db
        .select({
          suggestion: schema.suggestion,
          reviewerName: schema.user.name,
          reviewerImage: schema.user.image,
        })
        .from(schema.suggestion)
        .leftJoin(schema.user, eq(schema.suggestion.reviewedBy, schema.user.id))
        .where(and(...conditions))
        .orderBy(desc(schema.suggestion.createdAt))

      return suggestions.map(
        ({ suggestion: s, reviewerName, reviewerImage }) => ({
          id: s.id,
          organizationId: s.organizationId,
          targetType: s.targetType,
          targetId: s.targetId,
          action: s.action,
          field: s.field,
          label: s.label,
          currentValue: s.currentValue,
          proposedValue: s.proposedValue,
          confidence: s.confidence,
          source: s.source,
          reasoning: s.reasoning,
          triggerRunId: s.triggerRunId,
          status: s.status,
          reviewedBy: s.reviewedBy,
          reviewedAt: s.reviewedAt?.toISOString() ?? null,
          reviewerName: reviewerName ?? null,
          reviewerImage: reviewerImage ?? null,
          createdAt: s.createdAt.toISOString(),
          updatedAt: s.updatedAt.toISOString(),
        }),
      )
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const [s] = await ctx.db
        .select()
        .from(schema.suggestion)
        .where(eq(schema.suggestion.id, input.id))
        .limit(1)

      if (!s) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Suggestion not found',
        })
      }

      await verifyAccess(
        ctx.db,
        ctx.session.user.id,
        s.organizationId,
        ctx.session.user.superAdmin,
      )

      return {
        id: s.id,
        organizationId: s.organizationId,
        targetType: s.targetType,
        targetId: s.targetId,
        action: s.action,
        field: s.field,
        label: s.label,
        currentValue: s.currentValue,
        proposedValue: s.proposedValue,
        confidence: s.confidence,
        source: s.source,
        reasoning: s.reasoning,
        triggerRunId: s.triggerRunId,
        status: s.status,
        reviewedBy: s.reviewedBy,
        reviewedAt: s.reviewedAt?.toISOString() ?? null,
        createdAt: s.createdAt.toISOString(),
        updatedAt: s.updatedAt.toISOString(),
      }
    }),

  accept: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const [s] = await ctx.db
        .select()
        .from(schema.suggestion)
        .where(eq(schema.suggestion.id, input.id))
        .limit(1)

      if (!s) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Suggestion not found',
        })
      }

      await verifyAccess(
        ctx.db,
        ctx.session.user.id,
        s.organizationId,
        ctx.session.user.superAdmin,
      )

      if (s.status !== 'pending') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Suggestion is already ${s.status}`,
        })
      }

      const now = new Date()

      if (
        typeof s.proposedValue !== 'object' ||
        s.proposedValue === null ||
        Array.isArray(s.proposedValue)
      ) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'proposedValue must be an object',
        })
      }
      const proposed = s.proposedValue as Record<string, unknown>

      // Apply the change based on targetType and action
      if (s.targetType === 'product' && s.action === 'create') {
        if (s.targetId) {
          // Draft product already created by agent — activate it and create version 1
          const draft = await ctx.db.query.product.findFirst({
            where: eq(schema.product.id, s.targetId),
          })

          if (!draft) {
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: 'Linked draft product not found',
            })
          }

          const [version] = await ctx.db
            .insert(schema.productVersion)
            .values({
              productId: draft.id,
              version: 1,
              name: draft.name,
              description: draft.description,
              price: draft.price,
              unit: draft.unit,
              category: draft.category,
              images: draft.images,
              data: draft.data,
              editedBy: ctx.session.user.id,
              note: 'Activated from agent suggestion',
              createdAt: now,
            })
            .returning({ id: schema.productVersion.id })

          await ctx.db
            .update(schema.product)
            .set({
              status: 'active',
              currentVersionId: version.id,
              updatedAt: now,
            })
            .where(eq(schema.product.id, draft.id))

          await ctx.db
            .update(schema.suggestion)
            .set({
              status: 'accepted',
              reviewedBy: ctx.session.user.id,
              reviewedAt: now,
              updatedAt: now,
            })
            .where(eq(schema.suggestion.id, input.id))

          return { success: true, productId: draft.id }
        }

        // Legacy fallback: no draft product exists, create from scratch
        // Check for duplicates by articleNumber/GTIN before creating
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
          const [existing] = await ctx.db
            .select({ id: schema.product.id })
            .from(schema.product)
            .where(
              sql`${schema.product.organizationId} = ${s.organizationId} AND ${schema.product.data}->>'articleNumber' = ${articleNumber}`,
            )
            .limit(1)

          if (existing) {
            throw new TRPCError({
              code: 'CONFLICT',
              message: `Product with articleNumber ${articleNumber} already exists`,
            })
          }
        }

        if (gtin) {
          const [existing] = await ctx.db
            .select({ id: schema.product.id })
            .from(schema.product)
            .where(
              sql`${schema.product.organizationId} = ${s.organizationId} AND ${schema.product.data}->'unit'->>'gtin' = ${gtin}`,
            )
            .limit(1)

          if (existing) {
            throw new TRPCError({
              code: 'CONFLICT',
              message: `Product with GTIN ${gtin} already exists`,
            })
          }
        }

        // Extract top-level columns from proposedValue, rest goes to data
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

        const inserted = await ctx.db
          .insert(schema.product)
          .values({
            organizationId: s.organizationId,
            name,
            description,
            price,
            unit: typeof unit === 'string' ? unit : null,
            category,
            data: productData,
            status: 'active',
            createdAt: now,
            updatedAt: now,
          })
          .returning({ id: schema.product.id })

        // Insert version 1
        const [version] = await ctx.db
          .insert(schema.productVersion)
          .values({
            productId: inserted[0].id,
            version: 1,
            name,
            description,
            price,
            unit: typeof unit === 'string' ? unit : null,
            category,
            data: productData,
            editedBy: ctx.session.user.id,
            note: 'Created via suggestion',
            createdAt: now,
          })
          .returning({ id: schema.productVersion.id })

        // Update product with currentVersionId
        await ctx.db
          .update(schema.product)
          .set({ currentVersionId: version.id })
          .where(eq(schema.product.id, inserted[0].id))

        // Update suggestion with the new product's ID
        await ctx.db
          .update(schema.suggestion)
          .set({
            status: 'accepted',
            targetId: inserted[0].id,
            reviewedBy: ctx.session.user.id,
            reviewedAt: now,
            updatedAt: now,
          })
          .where(eq(schema.suggestion.id, input.id))

        return { success: true, productId: inserted[0].id }
      }

      if (s.targetType === 'product' && s.action === 'update_field') {
        if (!s.targetId) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'update_field requires a targetId',
          })
        }

        if (!s.field || !PRODUCT_UPDATABLE_FIELDS.has(s.field)) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `'${s.field ?? '(empty)'}' is not a valid updatable product field`,
          })
        }

        await ctx.db
          .update(schema.product)
          .set({
            [s.field]: s.proposedValue,
            updatedAt: now,
          })
          .where(eq(schema.product.id, s.targetId))

        // Insert a new version after the update
        const updatedProduct = await ctx.db.query.product.findFirst({
          where: eq(schema.product.id, s.targetId),
        })

        if (updatedProduct) {
          const [maxRow] = await ctx.db
            .select({
              maxVersion: sql<number>`COALESCE(MAX(${schema.productVersion.version}), 0)`,
            })
            .from(schema.productVersion)
            .where(eq(schema.productVersion.productId, s.targetId))

          const nextVersion = (maxRow?.maxVersion ?? 0) + 1

          const [version] = await ctx.db
            .insert(schema.productVersion)
            .values({
              productId: s.targetId,
              version: nextVersion,
              name: updatedProduct.name,
              description: updatedProduct.description,
              price: updatedProduct.price,
              unit: updatedProduct.unit,
              category: updatedProduct.category,
              images: updatedProduct.images,
              data: updatedProduct.data,
              editedBy: ctx.session.user.id,
              note: 'Updated via suggestion',
              createdAt: now,
            })
            .returning({ id: schema.productVersion.id })

          await ctx.db
            .update(schema.product)
            .set({ currentVersionId: version.id })
            .where(eq(schema.product.id, s.targetId))
        }
      }

      if (s.targetType === 'organization' && s.action === 'update_field') {
        if (!s.targetId) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'update_field requires a targetId',
          })
        }

        if (!s.field || !ORGANIZATION_UPDATABLE_FIELDS.has(s.field)) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `'${s.field ?? '(empty)'}' is not a valid updatable organization field`,
          })
        }

        await ctx.db
          .update(schema.organization)
          .set({
            [s.field]: s.proposedValue,
            updatedAt: now,
          })
          .where(eq(schema.organization.id, s.targetId))
      }

      if (s.targetType === 'organization' && s.action === 'update') {
        if (!s.targetId) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'update requires a targetId',
          })
        }

        // Merge proposedValue into organization.data
        await ctx.db
          .update(schema.organization)
          .set({
            data: sql`COALESCE(${schema.organization.data}, '{}'::jsonb) || ${JSON.stringify(s.proposedValue)}::jsonb`,
            updatedAt: now,
          })
          .where(eq(schema.organization.id, s.targetId))
      }

      // Mark suggestion as accepted
      await ctx.db
        .update(schema.suggestion)
        .set({
          status: 'accepted',
          reviewedBy: ctx.session.user.id,
          reviewedAt: now,
          updatedAt: now,
        })
        .where(eq(schema.suggestion.id, input.id))

      await trackEvent(ctx.db, {
        organizationId: s.organizationId,
        actorId: ctx.session.user.id,
        action: 'suggestion.accepted',
        entityType: 'suggestion',
        entityId: s.id,
        payload: { targetType: s.targetType, action: s.action },
      })

      return { success: true }
    }),

  dismiss: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const [s] = await ctx.db
        .select()
        .from(schema.suggestion)
        .where(eq(schema.suggestion.id, input.id))
        .limit(1)

      if (!s) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Suggestion not found',
        })
      }

      await verifyAccess(
        ctx.db,
        ctx.session.user.id,
        s.organizationId,
        ctx.session.user.superAdmin,
      )

      const now = new Date()
      await ctx.db
        .update(schema.suggestion)
        .set({
          status: 'dismissed',
          reviewedBy: ctx.session.user.id,
          reviewedAt: now,
          updatedAt: now,
        })
        .where(eq(schema.suggestion.id, input.id))

      // Archive linked draft product when dismissing a product create suggestion
      if (s.targetType === 'product' && s.action === 'create' && s.targetId) {
        await ctx.db
          .update(schema.product)
          .set({
            status: 'archived',
            archivedAt: now,
            updatedAt: now,
          })
          .where(eq(schema.product.id, s.targetId))
      }

      await trackEvent(ctx.db, {
        organizationId: s.organizationId,
        actorId: ctx.session.user.id,
        action: 'suggestion.dismissed',
        entityType: 'suggestion',
        entityId: s.id,
      })

      return { success: true }
    }),

  revertToPending: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const [s] = await ctx.db
        .select()
        .from(schema.suggestion)
        .where(eq(schema.suggestion.id, input.id))
        .limit(1)

      if (!s) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Suggestion not found',
        })
      }

      await verifyAccess(
        ctx.db,
        ctx.session.user.id,
        s.organizationId,
        ctx.session.user.superAdmin,
      )

      if (s.status === 'pending') {
        return { success: true }
      }

      const now = new Date()
      await ctx.db
        .update(schema.suggestion)
        .set({
          status: 'pending',
          reviewedBy: null,
          reviewedAt: null,
          updatedAt: now,
        })
        .where(eq(schema.suggestion.id, input.id))

      await trackEvent(ctx.db, {
        organizationId: s.organizationId,
        actorId: ctx.session.user.id,
        action: 'suggestion.reverted',
        entityType: 'suggestion',
        entityId: s.id,
      })

      return { success: true }
    }),

  pendingCount: protectedProcedure
    .input(z.object({ organizationId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      await verifyAccess(
        ctx.db,
        ctx.session.user.id,
        input.organizationId,
        ctx.session.user.superAdmin,
      )

      const [result] = await ctx.db
        .select({ count: count() })
        .from(schema.suggestion)
        .where(
          and(
            eq(schema.suggestion.organizationId, input.organizationId),
            eq(schema.suggestion.status, 'pending'),
          ),
        )

      return { count: result.count }
    }),
})
