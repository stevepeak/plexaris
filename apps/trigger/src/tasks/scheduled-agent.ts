import { createDb, eq, schema } from '@app/db'
import { logger, schedules, tasks } from '@trigger.dev/sdk'

import {
  type discoverProductsTask,
  type scrapeOrganizationTask,
} from '../index'

export const scheduledAgentTask = schedules.task({
  id: 'scheduled-agent',
  run: async (payload) => {
    const scheduleId = payload.externalId
    if (!scheduleId) {
      throw new Error('externalId (agentSchedule.id) is required')
    }

    const db = createDb()

    // Fetch the schedule config
    const [schedule] = await db
      .select()
      .from(schema.agentSchedule)
      .where(eq(schema.agentSchedule.id, scheduleId))
      .limit(1)

    if (!schedule) {
      throw new Error(`Agent schedule not found: ${scheduleId}`)
    }

    const { organizationId, scheduleType, urls } = schedule

    // Fetch file IDs for this org
    const files = await db
      .select({ id: schema.file.id })
      .from(schema.file)
      .where(eq(schema.file.organizationId, organizationId))

    const fileIds = files.map((f) => f.id)

    logger.log('Scheduled agent triggered', {
      scheduleId,
      scheduleType,
      organizationId,
      urlCount: urls.length,
    })

    // Dispatch to the appropriate task based on schedule type
    const now = new Date()

    if (
      scheduleType === 'org_information_update' ||
      scheduleType === 'competitive_analysis'
    ) {
      const handle = await tasks.trigger<typeof scrapeOrganizationTask>(
        'scrape-organization',
        { organizationId, urls, fileIds },
      )

      await db.insert(schema.triggerRun).values({
        organizationId,
        triggerRunId: handle.id,
        taskType: 'scrape-organization',
        label: `Scheduled: ${scheduleType.replace(/_/g, ' ')}`,
        status: 'running',
        createdAt: now,
        updatedAt: now,
      })
    } else if (scheduleType === 'product_updating') {
      const handle = await tasks.trigger<typeof discoverProductsTask>(
        'discover-products',
        { organizationId, urls, fileIds },
      )

      await db.insert(schema.triggerRun).values({
        organizationId,
        triggerRunId: handle.id,
        taskType: 'discover-products',
        label: `Scheduled: product updating`,
        status: 'running',
        createdAt: now,
        updatedAt: now,
      })
    }
  },
})
