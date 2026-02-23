import {
  createReadFileTool,
  createSuggestOrganizationTool,
  scrapeOrganizationAgent,
} from '@app/agents'
import { createDb, eq, schema } from '@app/db'
import { createHttpTools } from '@app/http'
import { logger, streams, task } from '@trigger.dev/sdk'

export const scrapeOrganizationTask = task({
  id: 'scrape-organization',
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

    logger.log('Starting organization scrape', {
      organizationId,
      url,
      fileId,
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

    // 2. Upsert trigger_run row (handles retries + pre-inserted rows)
    const now = new Date()
    await db
      .insert(schema.triggerRun)
      .values({
        organizationId,
        triggerRunId,
        taskType: 'scrape-organization',
        label: `Extracting org details from ${url ?? 'uploaded file'}`,
        parentRunId: parentRunId ?? null,
        status: 'running',
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: schema.triggerRun.triggerRunId,
        set: { status: 'running', updatedAt: now },
      })

    void streams.append('progress', 'Starting organization scrape...')

    try {
      // 3. Set up scraper tools
      const httpTools = createHttpTools({
        onProgress: (message) => {
          void streams.append('progress', message)
        },
      })

      const tools = {
        ...httpTools,
        readFile: createReadFileTool(),
        suggestOrganization: createSuggestOrganizationTool(triggerRunId),
      }

      void streams.append(
        'progress',
        'HTTP tools initialized, starting agent...',
      )

      // 4. Run the scraping agent
      const result = await scrapeOrganizationAgent({
        organizationId,
        organizationType: org.type,
        url,
        fileId,
        tools,
        onProgress: (message) => {
          void streams.append('progress', message)
        },
      })

      void streams.append('progress', 'Scraping complete.')

      // 5. Update trigger_run status to completed
      await db
        .update(schema.triggerRun)
        .set({ status: 'completed', updatedAt: new Date() })
        .where(eq(schema.triggerRun.triggerRunId, triggerRunId))

      void streams.append('progress', 'Organization scrape completed!')

      logger.log('Organization scrape completed', {
        organizationId,
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
        `Scrape failed: ${error instanceof Error ? error.message : String(error)}`,
      )

      throw error
    }
  },
})
