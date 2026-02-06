import { createOpenAI } from '@ai-sdk/openai'
import {
  createQueryDatabaseTool,
  createReadFileTool,
  scrapeProductAgent,
} from '@app/agents'
import { createBrowserSession } from '@app/browserbase'
import { getConfig } from '@app/config'
import { createDb, eq, schema } from '@app/db'
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
    const config = getConfig()
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
      // 2. Set up AI model and browser session
      const openai = createOpenAI({ apiKey: config.OPENAI_API_KEY })
      const model = openai('gpt-4o')

      const session = await createBrowserSession({
        apiKey: config.AI_GATEWAY_API_KEY,
        modelName: 'gpt-4o',
        modelClientOptions: { apiKey: config.OPENAI_API_KEY },
        onProgress: (message) => {
          void streams.append('progress', message)
        },
      })

      const tools = {
        ...session.tools,
        readFile: createReadFileTool(),
        queryDatabase: createQueryDatabaseTool(),
      }

      void streams.append(
        'progress',
        'Browser initialized, scraping product...',
      )

      // 3. Run the product scraping agent
      const result = await scrapeProductAgent({
        model: model as unknown as Parameters<
          typeof scrapeProductAgent
        >[0]['model'],
        organizationId,
        productUrl,
        fileId,
        productHint,
        tools,
        onProgress: (message) => {
          void streams.append('progress', message)
        },
      })

      // 4. Close the browser
      await session.close()

      // 5. Update trigger_run status to completed
      await db
        .update(schema.triggerRun)
        .set({ status: 'completed', updatedAt: new Date() })
        .where(eq(schema.triggerRun.triggerRunId, triggerRunId))

      void streams.append(
        'progress',
        `Product scrape completed: ${result.productName} (${result.isNew ? 'new' : 'updated'})`,
      )

      logger.log('Product scrape completed', {
        productId: result.productId,
        productName: result.productName,
        isNew: result.isNew,
        fieldsExtracted: result.fieldsExtracted,
        issuesCount: result.issuesCount,
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
