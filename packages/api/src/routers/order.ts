import { count, type DB, desc, eq, inArray, isNull, schema, sql } from '@app/db'
import { TRPCError } from '@trpc/server'
import { and } from 'drizzle-orm'
import { z } from 'zod'

import { trackEvent } from '../lib/audit'
import { hasPermission, verifyAccess } from '../lib/verify-access'
import { protectedProcedure, router } from '../trpc'

async function verifyOrderAccess(
  db: DB,
  userId: string,
  orderId: string,
  superAdmin: boolean,
) {
  const [row] = await db
    .select({
      id: schema.order.id,
      organizationId: schema.order.organizationId,
    })
    .from(schema.order)
    .where(eq(schema.order.id, orderId))
    .limit(1)

  if (!row) {
    throw new TRPCError({ code: 'NOT_FOUND', message: 'Order not found' })
  }

  await verifyAccess(db, userId, row.organizationId, superAdmin)
  return row
}

function logEvent(
  db: DB,
  orderId: string,
  type: (typeof schema.orderEventTypeEnum.enumValues)[number],
  actorId: string,
  payload: Record<string, unknown> = {},
) {
  return db.insert(schema.orderEvent).values({
    orderId,
    type,
    actorId,
    payload,
    createdAt: new Date(),
  })
}

export const orderRouter = router({
  list: protectedProcedure
    .input(z.object({ organizationId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      await verifyAccess(
        ctx.db,
        ctx.session.user.id,
        input.organizationId,
        ctx.session.user.superAdmin,
      )

      const itemCount = ctx.db
        .select({
          orderId: schema.orderItem.orderId,
          count: count().as('item_count'),
        })
        .from(schema.orderItem)
        .where(isNull(schema.orderItem.removedAt))
        .groupBy(schema.orderItem.orderId)
        .as('item_counts')

      const rows = await ctx.db
        .select({
          id: schema.order.id,
          status: schema.order.status,
          notes: schema.order.notes,
          createdAt: schema.order.createdAt,
          updatedAt: schema.order.updatedAt,
          submittedAt: schema.order.submittedAt,
          createdByName: schema.user.name,
          itemCount: itemCount.count,
        })
        .from(schema.order)
        .innerJoin(schema.user, eq(schema.order.createdBy, schema.user.id))
        .leftJoin(itemCount, eq(schema.order.id, itemCount.orderId))
        .where(
          and(
            eq(schema.order.organizationId, input.organizationId),
            isNull(schema.order.archivedAt),
          ),
        )
        .orderBy(
          desc(
            sql`CASE WHEN ${schema.order.status} = 'draft' THEN 0 ELSE 1 END`,
          ),
          desc(schema.order.updatedAt),
        )

      return rows.map((r) => ({ ...r, itemCount: r.itemCount ?? 0 }))
    }),

  create: protectedProcedure
    .input(z.object({ organizationId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await verifyAccess(
        ctx.db,
        ctx.session.user.id,
        input.organizationId,
        ctx.session.user.superAdmin,
      )

      const now = new Date()
      const [row] = await ctx.db
        .insert(schema.order)
        .values({
          organizationId: input.organizationId,
          createdBy: ctx.session.user.id,
          status: 'draft',
          createdAt: now,
          updatedAt: now,
        })
        .returning({ id: schema.order.id })

      if (!row) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create order',
        })
      }

      await logEvent(ctx.db, row.id, 'order_created', ctx.session.user.id)
      await trackEvent(ctx.db, {
        organizationId: input.organizationId,
        actorId: ctx.session.user.id,
        action: 'order.created',
        entityType: 'order',
        entityId: row.id,
      })

      return { orderId: row.id }
    }),

  get: protectedProcedure
    .input(z.object({ orderId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const orderRow = await verifyOrderAccess(
        ctx.db,
        ctx.session.user.id,
        input.orderId,
        ctx.session.user.superAdmin,
      )

      const [orderData] = await ctx.db
        .select()
        .from(schema.order)
        .where(eq(schema.order.id, input.orderId))
        .limit(1)

      const items = await ctx.db
        .select({
          id: schema.orderItem.id,
          productId: schema.orderItem.productId,
          supplierId: schema.orderItem.supplierId,
          quantity: schema.orderItem.quantity,
          unitPrice: schema.orderItem.unitPrice,
          unit: schema.orderItem.unit,
          addedBy: schema.orderItem.addedBy,
          createdAt: schema.orderItem.createdAt,
          productName: schema.product.name,
          productCategory: schema.product.category,
          supplierName: schema.organization.name,
          addedByName: schema.user.name,
        })
        .from(schema.orderItem)
        .innerJoin(
          schema.product,
          eq(schema.orderItem.productId, schema.product.id),
        )
        .innerJoin(
          schema.organization,
          eq(schema.orderItem.supplierId, schema.organization.id),
        )
        .innerJoin(schema.user, eq(schema.orderItem.addedBy, schema.user.id))
        .where(
          and(
            eq(schema.orderItem.orderId, input.orderId),
            isNull(schema.orderItem.removedAt),
          ),
        )

      if (!orderData) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Order not found',
        })
      }

      return {
        order: orderData,
        organizationId: orderRow.organizationId,
        items,
      }
    }),

  addItem: protectedProcedure
    .input(
      z.object({
        orderId: z.string().uuid(),
        productId: z.string().uuid(),
        supplierId: z.string().uuid(),
        quantity: z.number().int().positive().default(1),
        unitPrice: z.string(),
        unit: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const orderRow = await verifyOrderAccess(
        ctx.db,
        ctx.session.user.id,
        input.orderId,
        ctx.session.user.superAdmin,
      )

      const now = new Date()
      const [item] = await ctx.db
        .insert(schema.orderItem)
        .values({
          orderId: input.orderId,
          productId: input.productId,
          supplierId: input.supplierId,
          quantity: input.quantity,
          unitPrice: input.unitPrice,
          unit: input.unit,
          addedBy: ctx.session.user.id,
          createdAt: now,
          updatedAt: now,
        })
        .returning({ id: schema.orderItem.id })

      if (!item) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to add order item',
        })
      }

      await logEvent(ctx.db, input.orderId, 'item_added', ctx.session.user.id, {
        orderItemId: item.id,
        productId: input.productId,
        supplierId: input.supplierId,
        quantity: input.quantity,
      })

      await trackEvent(ctx.db, {
        organizationId: orderRow.organizationId,
        actorId: ctx.session.user.id,
        action: 'order.item_added',
        entityType: 'order',
        entityId: input.orderId,
        payload: { orderItemId: item.id, productId: input.productId },
      })

      return { orderItemId: item.id }
    }),

  removeItem: protectedProcedure
    .input(
      z.object({
        orderId: z.string().uuid(),
        orderItemId: z.string().uuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const orderRow = await verifyOrderAccess(
        ctx.db,
        ctx.session.user.id,
        input.orderId,
        ctx.session.user.superAdmin,
      )

      await ctx.db
        .update(schema.orderItem)
        .set({ removedAt: new Date(), updatedAt: new Date() })
        .where(
          and(
            eq(schema.orderItem.id, input.orderItemId),
            eq(schema.orderItem.orderId, input.orderId),
          ),
        )

      await logEvent(
        ctx.db,
        input.orderId,
        'item_removed',
        ctx.session.user.id,
        { orderItemId: input.orderItemId },
      )

      await trackEvent(ctx.db, {
        organizationId: orderRow.organizationId,
        actorId: ctx.session.user.id,
        action: 'order.item_removed',
        entityType: 'order',
        entityId: input.orderId,
        payload: { orderItemId: input.orderItemId },
      })
    }),

  updateQuantity: protectedProcedure
    .input(
      z.object({
        orderId: z.string().uuid(),
        orderItemId: z.string().uuid(),
        quantity: z.number().int().positive(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await verifyOrderAccess(
        ctx.db,
        ctx.session.user.id,
        input.orderId,
        ctx.session.user.superAdmin,
      )

      const [prev] = await ctx.db
        .select({ quantity: schema.orderItem.quantity })
        .from(schema.orderItem)
        .where(eq(schema.orderItem.id, input.orderItemId))
        .limit(1)

      await ctx.db
        .update(schema.orderItem)
        .set({ quantity: input.quantity, updatedAt: new Date() })
        .where(
          and(
            eq(schema.orderItem.id, input.orderItemId),
            eq(schema.orderItem.orderId, input.orderId),
          ),
        )

      await logEvent(
        ctx.db,
        input.orderId,
        'item_quantity_changed',
        ctx.session.user.id,
        {
          orderItemId: input.orderItemId,
          previousQuantity: prev?.quantity,
          newQuantity: input.quantity,
        },
      )
    }),

  updateSupplier: protectedProcedure
    .input(
      z.object({
        orderId: z.string().uuid(),
        orderItemId: z.string().uuid(),
        supplierId: z.string().uuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await verifyOrderAccess(
        ctx.db,
        ctx.session.user.id,
        input.orderId,
        ctx.session.user.superAdmin,
      )

      const [prev] = await ctx.db
        .select({ supplierId: schema.orderItem.supplierId })
        .from(schema.orderItem)
        .where(eq(schema.orderItem.id, input.orderItemId))
        .limit(1)

      await ctx.db
        .update(schema.orderItem)
        .set({ supplierId: input.supplierId, updatedAt: new Date() })
        .where(
          and(
            eq(schema.orderItem.id, input.orderItemId),
            eq(schema.orderItem.orderId, input.orderId),
          ),
        )

      await logEvent(
        ctx.db,
        input.orderId,
        'item_supplier_changed',
        ctx.session.user.id,
        {
          orderItemId: input.orderItemId,
          previousSupplierId: prev?.supplierId,
          newSupplierId: input.supplierId,
        },
      )
    }),

  archive: protectedProcedure
    .input(z.object({ orderId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const orderRow = await verifyOrderAccess(
        ctx.db,
        ctx.session.user.id,
        input.orderId,
        ctx.session.user.superAdmin,
      )

      const now = new Date()
      await ctx.db
        .update(schema.order)
        .set({ archivedAt: now, updatedAt: now })
        .where(eq(schema.order.id, input.orderId))

      await logEvent(
        ctx.db,
        input.orderId,
        'order_archived',
        ctx.session.user.id,
      )

      await trackEvent(ctx.db, {
        organizationId: orderRow.organizationId,
        actorId: ctx.session.user.id,
        action: 'order.archived',
        entityType: 'order',
        entityId: input.orderId,
      })

      return { success: true }
    }),

  submit: protectedProcedure
    .input(
      z.object({
        orderId: z.string().uuid(),
        deliveryNotes: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const orderRow = await verifyOrderAccess(
        ctx.db,
        ctx.session.user.id,
        input.orderId,
        ctx.session.user.superAdmin,
      )

      const canPlace = await hasPermission(
        ctx.db,
        ctx.session.user.id,
        orderRow.organizationId,
        ctx.session.user.superAdmin,
        'place_order',
      )
      if (!canPlace) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Missing place_order permission',
        })
      }

      const [order] = await ctx.db
        .select()
        .from(schema.order)
        .where(eq(schema.order.id, input.orderId))
        .limit(1)
      if (order?.status !== 'draft') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Order is not a draft',
        })
      }

      const [itemCount] = await ctx.db
        .select({ count: count() })
        .from(schema.orderItem)
        .where(
          and(
            eq(schema.orderItem.orderId, input.orderId),
            isNull(schema.orderItem.removedAt),
          ),
        )
      if (!itemCount?.count) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Order has no items',
        })
      }

      const now = new Date()
      await ctx.db
        .update(schema.order)
        .set({
          status: 'submitted',
          submittedAt: now,
          updatedAt: now,
          notes: input.deliveryNotes ?? order.notes,
        })
        .where(eq(schema.order.id, input.orderId))

      await logEvent(
        ctx.db,
        input.orderId,
        'order_submitted',
        ctx.session.user.id,
      )
      await trackEvent(ctx.db, {
        organizationId: orderRow.organizationId,
        actorId: ctx.session.user.id,
        action: 'order.submitted',
        entityType: 'order',
        entityId: input.orderId,
      })

      return { success: true }
    }),

  duplicate: protectedProcedure
    .input(z.object({ orderId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const sourceOrder = await verifyOrderAccess(
        ctx.db,
        ctx.session.user.id,
        input.orderId,
        ctx.session.user.superAdmin,
      )

      const sourceItems = await ctx.db
        .select()
        .from(schema.orderItem)
        .where(
          and(
            eq(schema.orderItem.orderId, input.orderId),
            isNull(schema.orderItem.removedAt),
          ),
        )

      const now = new Date()
      const [newOrder] = await ctx.db
        .insert(schema.order)
        .values({
          organizationId: sourceOrder.organizationId,
          createdBy: ctx.session.user.id,
          status: 'draft',
          createdAt: now,
          updatedAt: now,
        })
        .returning({ id: schema.order.id })

      if (!newOrder) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create order',
        })
      }

      await logEvent(ctx.db, newOrder.id, 'order_created', ctx.session.user.id)

      if (sourceItems.length > 0) {
        await ctx.db.insert(schema.orderItem).values(
          sourceItems.map((item) => ({
            orderId: newOrder.id,
            productId: item.productId,
            supplierId: item.supplierId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            unit: item.unit,
            addedBy: ctx.session.user.id,
            createdAt: now,
            updatedAt: now,
          })),
        )
      }

      await logEvent(
        ctx.db,
        input.orderId,
        'order_duplicated',
        ctx.session.user.id,
        { newOrderId: newOrder.id },
      )

      await trackEvent(ctx.db, {
        organizationId: sourceOrder.organizationId,
        actorId: ctx.session.user.id,
        action: 'order.duplicated',
        entityType: 'order',
        entityId: newOrder.id,
        payload: { sourceOrderId: input.orderId },
      })

      return { orderId: newOrder.id }
    }),

  getEvents: protectedProcedure
    .input(z.object({ orderId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      await verifyOrderAccess(
        ctx.db,
        ctx.session.user.id,
        input.orderId,
        ctx.session.user.superAdmin,
      )

      const events = await ctx.db
        .select({
          id: schema.orderEvent.id,
          type: schema.orderEvent.type,
          actorId: schema.orderEvent.actorId,
          actorName: schema.user.name,
          payload: schema.orderEvent.payload,
          createdAt: schema.orderEvent.createdAt,
        })
        .from(schema.orderEvent)
        .innerJoin(schema.user, eq(schema.orderEvent.actorId, schema.user.id))
        .where(eq(schema.orderEvent.orderId, input.orderId))
        .orderBy(desc(schema.orderEvent.createdAt))

      // Collect unique orderItemIds from payloads to batch-fetch names
      const orderItemIds = [
        ...new Set(
          events
            .map((e) => e.payload?.orderItemId as string | undefined)
            .filter((id): id is string => !!id),
        ),
      ]

      const itemNameMap = new Map<
        string,
        { productName: string; supplierName: string }
      >()

      if (orderItemIds.length > 0) {
        const itemRows = await ctx.db
          .select({
            id: schema.orderItem.id,
            productName: schema.product.name,
            supplierName: schema.organization.name,
          })
          .from(schema.orderItem)
          .innerJoin(
            schema.product,
            eq(schema.orderItem.productId, schema.product.id),
          )
          .innerJoin(
            schema.organization,
            eq(schema.orderItem.supplierId, schema.organization.id),
          )
          .where(inArray(schema.orderItem.id, orderItemIds))

        for (const row of itemRows) {
          itemNameMap.set(row.id, {
            productName: row.productName,
            supplierName: row.supplierName,
          })
        }
      }

      return events.map((e) => {
        const itemId = e.payload?.orderItemId as string | undefined
        const names = itemId ? itemNameMap.get(itemId) : undefined
        return {
          ...e,
          itemName: names?.productName ?? null,
          supplierName: names?.supplierName ?? null,
        }
      })
    }),
})
