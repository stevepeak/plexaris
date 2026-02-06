import {
  createReadFileTool,
  createSearchProductTool,
  createSuggestProductTool,
  scrapeProductAgent,
} from '@app/agents'
import { createDb, eq, schema } from '@app/db'
import { createHttpTools } from '@app/http'
import { logger, streams, task } from '@trigger.dev/sdk'

export const scrapeProductTask = task({
  id: 'scrape-product',
  run: async (
    args: {
      organizationId: string
      productUrl?: string
      fileId?: string
      productHint: string
    },
    { ctx },
  ) => {
    const { organizationId, productUrl, fileId, productHint } = args
    const db = createDb()
    const triggerRunId = ctx.run.id

    logger.log('Starting product scrape', {
      organizationId,
      productUrl,
      fileId,
      productHint,
    })

    // 1. Insert trigger_run row
    const now = new Date()
    await db.insert(schema.triggerRun).values({
      organizationId,
      triggerRunId,
      taskType: 'scrape-product',
      label: `Processing product: ${productHint}`,
      status: 'running',
      createdAt: now,
      updatedAt: now,
    })

    void streams.append('progress', `Starting product scrape: ${productHint}`)

    try {
      // 2. Set up scraper tools
      const httpTools = createHttpTools({
        onProgress: (message) => {
          void streams.append('progress', message)
        },
      })

      const tools = {
        ...httpTools,
        readFile: createReadFileTool(),
        searchProduct: createSearchProductTool(),
        suggestProduct: createSuggestProductTool(triggerRunId),
      }

      void streams.append(
        'progress',
        'HTTP tools initialized, scraping product...',
      )

      // 3. Run the product scraping agent
      const result = await scrapeProductAgent({
        organizationId,
        productUrl,
        fileId,
        productHint,
        tools,
        onProgress: (message) => {
          void streams.append('progress', message)
        },
      })

      // 4. Update trigger_run status to completed
      await db
        .update(schema.triggerRun)
        .set({ status: 'completed', updatedAt: new Date() })
        .where(eq(schema.triggerRun.triggerRunId, triggerRunId))

      void streams.append(
        'progress',
        `Product scrape completed: ${result.productName} (${result.suggestionsCreated} suggestions created)`,
      )

      logger.log('Product scrape completed', {
        productName: result.productName,
        suggestionsCreated: result.suggestionsCreated,
        fieldsExtracted: Object.keys(result.data).length,
        issuesCount: result.issues.length,
      })

      return result
    } catch (error) {
      await db
        .update(schema.triggerRun)
        .set({ status: 'failed', updatedAt: new Date() })
        .where(eq(schema.triggerRun.triggerRunId, triggerRunId))

      void streams.append(
        'progress',
        `Product scrape failed: ${error instanceof Error ? error.message : String(error)}`,
      )

      throw error
    }
  },
})
