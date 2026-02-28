import { createReadFileTool, discoverProductsAgent } from '@app/agents'
import { createDb, eq, schema } from '@app/db'
import { createHttpTools } from '@app/http'
import { logger, streams, task } from '@trigger.dev/sdk'

import { scrapeProductTask } from './scrape-product'

export const discoverProductsTask = task({
  id: 'discover-products',
  run: async (
    args: {
      organizationId: string
      url?: string
      fileId?: string
      parentRunId?: string
    },
    { ctx },
  ) => {
    const { organizationId, url, fileId, parentRunId } = args
    const db = createDb()
    const triggerRunId = ctx.run.id

    logger.log('Starting product discovery', {
      organizationId,
      url,
      fileId,
    })

    // 1. Upsert trigger_run row (handles retries + pre-inserted rows)
    const now = new Date()
    await db
      .insert(schema.triggerRun)
      .values({
        organizationId,
        triggerRunId,
        taskType: 'discover-products',
        label: `Discovering products from ${url ?? 'uploaded file'}`,
        parentRunId: parentRunId ?? null,
        status: 'running',
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: schema.triggerRun.triggerRunId,
        set: { status: 'running', updatedAt: now },
      })

    void streams.append('progress', 'Starting product discovery...')

    try {
      // 2. Set up tools (HTTP + readFile only, no queryDatabase)
      const httpTools = createHttpTools({
        onProgress: (message) => {
          void streams.append('progress', message)
        },
      })

      const tools = {
        ...httpTools,
        readFile: createReadFileTool(),
      }

      void streams.append(
        'progress',
        'HTTP tools initialized, starting discovery agent...',
      )

      // 3. Run the discovery agent
      const result = await discoverProductsAgent({
        organizationId,
        url,
        fileId,
        tools,
        onProgress: (message) => {
          void streams.append('progress', message)
        },
      })

      void streams.append(
        'progress',
        `Discovery complete. Found ${result.productsDiscovered.length} products.`,
      )

      // 4. Spawn product scrape sub-tasks for each discovered product
      for (const product of result.productsDiscovered) {
        void streams.append(
          'progress',
          `Spawning product scrape: ${product.name}`,
        )
        await scrapeProductTask.trigger(
          {
            organizationId,
            productUrl: product.url ?? undefined,
            productHint: product.name,
          },
          { tags: ctx.run.tags },
        )
      }

      // 5. Update trigger_run status to completed
      await db
        .update(schema.triggerRun)
        .set({ status: 'completed', updatedAt: new Date() })
        .where(eq(schema.triggerRun.triggerRunId, triggerRunId))

      void streams.append('progress', 'Product discovery completed!')

      logger.log('Product discovery completed', {
        organizationId,
        productsDiscovered: result.productsDiscovered.length,
      })

      return result
    } catch (error) {
      await db
        .update(schema.triggerRun)
        .set({ status: 'failed', updatedAt: new Date() })
        .where(eq(schema.triggerRun.triggerRunId, triggerRunId))

      void streams.append(
        'progress',
        `Discovery failed: ${error instanceof Error ? error.message : String(error)}`,
      )

      throw error
    }
  },
})
