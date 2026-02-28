import { createDb, eq, schema } from '@app/db'
import { logger, schedules, tasks } from '@trigger.dev/sdk'

import { type alignSourcesTask } from '../index'

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

    const handle = await tasks.trigger<typeof alignSourcesTask>(
      'align-sources',
      { organizationId, urls, fileIds },
      { tags: [`org_${organizationId}`] },
    )

    await db
      .insert(schema.triggerRun)
      .values({
        organizationId,
        triggerRunId: handle.id,
        taskType: 'align-sources',
        label: `Scheduled: ${scheduleType.replace(/_/g, ' ')}`,
        status: 'running',
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: schema.triggerRun.triggerRunId,
        set: { status: 'running', updatedAt: now },
      })
  },
})
