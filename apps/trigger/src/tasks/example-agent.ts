import { exampleAgent } from '@app/agents'
import { logger, streams, task } from '@trigger.dev/sdk'

export const exampleAgentTask = task({
  id: 'example-agent',
  run: async (args: {
    name?: string
  }): Promise<{
    message: string
    timestamp: string
    data: { count: number; items: string[] } | null
  }> => {
    const name = args.name ?? 'World'

    logger.log('Starting example agent task', { name })
    void streams.append('progress', `Starting task for ${name}...`)

    void streams.append('progress', 'Initializing AI model...')

    const result = await exampleAgent({
      name,
    })

    void streams.append('progress', 'Agent completed successfully!')

    logger.log('Example agent task completed', { result })

    return result
  },
})
