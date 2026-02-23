import { createDb, eq, inArray, schema } from '@app/db'
import { logger, streams, task } from '@trigger.dev/sdk'

import { discoverProductsTask } from './discover-products'
import { scrapeOrganizationTask } from './scrape-organization'

export const alignSourcesTask = task({
  id: 'align-sources',
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
    const parentRunId = ctx.run.id

    logger.log('Starting align-sources orchestrator', {
      organizationId,
      urlCount: urls.length,
      fileCount: fileIds.length,
    })

    // Fetch org type
    const [org] = await db
      .select({ type: schema.organization.type })
      .from(schema.organization)
      .where(eq(schema.organization.id, organizationId))
      .limit(1)

    if (!org) {
      throw new Error(`Organization not found: ${organizationId}`)
    }

    // Resolve file names for labels
    const fileNameMap = new Map<string, string>()
    if (fileIds.length > 0) {
      const files = await db
        .select({ id: schema.file.id, name: schema.file.name })
        .from(schema.file)
        .where(inArray(schema.file.id, fileIds))
      for (const f of files) {
        fileNameMap.set(f.id, f.name)
      }
    }

    // Upsert orchestrator trigger_run row (handles retries gracefully)
    const now = new Date()
    await db
      .insert(schema.triggerRun)
      .values({
        organizationId,
        triggerRunId: parentRunId,
        taskType: 'align-sources',
        label: `Processing ${urls.length + fileIds.length} sources`,
        status: 'running',
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: schema.triggerRun.triggerRunId,
        set: { status: 'running', updatedAt: now },
      })

    void streams.append('progress', 'Dispatching agents for each source...')

    // Fan out: for each source, trigger scrape-organization + discover-products
    const childRuns: string[] = []

    for (const url of urls) {
      const scrapeHandle = await scrapeOrganizationTask.trigger({
        organizationId,
        url,
        parentRunId,
      })
      childRuns.push(scrapeHandle.id)

      const discoverHandle = await discoverProductsTask.trigger({
        organizationId,
        url,
        parentRunId,
      })
      childRuns.push(discoverHandle.id)

      void streams.append('progress', `Dispatched agents for URL: ${url}`)
    }

    for (const fileId of fileIds) {
      const fileName = fileNameMap.get(fileId) ?? fileId

      const scrapeHandle = await scrapeOrganizationTask.trigger({
        organizationId,
        fileId,
        parentRunId,
      })
      childRuns.push(scrapeHandle.id)

      const discoverHandle = await discoverProductsTask.trigger({
        organizationId,
        fileId,
        parentRunId,
      })
      childRuns.push(discoverHandle.id)

      void streams.append('progress', `Dispatched agents for file: ${fileName}`)
    }

    // Mark orchestrator as completed (children run independently)
    await db
      .update(schema.triggerRun)
      .set({ status: 'completed', updatedAt: new Date() })
      .where(eq(schema.triggerRun.triggerRunId, parentRunId))

    void streams.append(
      'progress',
      `Orchestrator complete. Dispatched ${childRuns.length} child agents.`,
    )

    logger.log('Align-sources orchestrator completed', {
      organizationId,
      childRunCount: childRuns.length,
    })

    return { parentRunId, childRuns }
  },
})
