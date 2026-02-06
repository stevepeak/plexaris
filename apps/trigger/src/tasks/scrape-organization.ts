import { createOpenAI } from '@ai-sdk/openai'
import {
  createQueryDatabaseTool,
  createReadFileTool,
  scrapeOrganizationAgent,
} from '@app/agents'
import { createBrowserSession } from '@app/browserbase'
import { getConfig } from '@app/config'
import { createDb, eq, schema } from '@app/db'
import { logger, streams, task } from '@trigger.dev/sdk'

import { scrapeProductTask } from './scrape-product'

export const scrapeOrganizationTask = task({
  id: 'scrape-organization',
  run: async (args: {
    organizationId: string
    urls: string[]
    fileIds: string[]
  }) => {
    const { organizationId, urls, fileIds } = args
    const config = getConfig()
    const db = createDb()

    logger.log('Starting organization scrape', {
      organizationId,
      urlCount: urls.length,
      fileCount: fileIds.length,
    })

    // 1. Fetch the organization to determine type
    const [org] = await db
      .select({ type: schema.organization.type })
      .from(schema.organization)
      .where(eq(schema.organization.id, organizationId))
      .limit(1)

    if (!org) {
      throw new Error(`Organization not found: ${organizationId}`)
    }

    // 2. Insert trigger_run row
    const now = new Date()
    const triggerRunId = `scrape-org-${organizationId}-${Date.now()}`
    await db.insert(schema.triggerRun).values({
      organizationId,
      triggerRunId,
      taskType: 'scrape-organization',
      label: `Scraping ${urls[0] ?? 'uploaded files'}`,
      status: 'running',
      createdAt: now,
      updatedAt: now,
    })

    void streams.append('progress', 'Starting organization scrape...')

    try {
      // 3. Set up AI model and browser session
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

      void streams.append('progress', 'Browser initialized, starting agent...')

      // 4. Run the scraping agent
      const result = await scrapeOrganizationAgent({
        model: model as unknown as Parameters<
          typeof scrapeOrganizationAgent
        >[0]['model'],
        organizationId,
        organizationType: org.type,
        urls,
        fileIds,
        tools,
        onProgress: (message) => {
          void streams.append('progress', message)
        },
      })

      void streams.append(
        'progress',
        `Scraping complete. Found ${result.productsDiscovered.length} products.`,
      )

      // 5. Spawn product scrape sub-tasks for each discovered product
      for (const product of result.productsDiscovered) {
        void streams.append(
          'progress',
          `Spawning product scrape: ${product.name}`,
        )
        await scrapeProductTask.trigger({
          organizationId,
          productUrl: product.url,
          productHint: product.name,
        })
      }

      // 6. Close the browser
      await session.close()

      // 7. Update trigger_run status to completed
      await db
        .update(schema.triggerRun)
        .set({ status: 'completed', updatedAt: new Date() })
        .where(eq(schema.triggerRun.triggerRunId, triggerRunId))

      void streams.append('progress', 'Organization scrape completed!')

      logger.log('Organization scrape completed', {
        organizationId,
        fieldsExtracted: result.fieldsExtracted,
        issuesCount: result.issuesCount,
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
        `Scrape failed: ${error instanceof Error ? error.message : String(error)}`,
      )

      throw error
    }
  },
})
