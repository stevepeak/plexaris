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
      urls: string[]
      fileIds: string[]
    },
    { ctx },
  ) => {
    const { organizationId, urls, fileIds } = args
    const db = createDb()
    const triggerRunId = ctx.run.id

    logger.log('Starting product discovery', {
      organizationId,
      urlCount: urls.length,
      fileCount: fileIds.length,
    })

    // 1. Ensure trigger_run row exists (may already be inserted by the tRPC mutation)
    const now = new Date()
    const [existing] = await db
      .select({ id: schema.triggerRun.id })
      .from(schema.triggerRun)
      .where(eq(schema.triggerRun.triggerRunId, triggerRunId))
      .limit(1)

    if (!existing) {
      await db.insert(schema.triggerRun).values({
        organizationId,
        triggerRunId,
        taskType: 'discover-products',
        label: 'Discovering products...',
        status: 'running',
        createdAt: now,
        updatedAt: now,
      })
    }

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
        urls,
        fileIds,
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
        await scrapeProductTask.trigger({
          organizationId,
          productUrl: product.url ?? undefined,
          productHint: product.name,
        })
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
