import { type Meta, type StoryObj } from '@storybook/react'

import {
  type ActiveRun,
  ActiveTasksCardStatic,
} from './active-tasks-card-static'

const meta: Meta<typeof ActiveTasksCardStatic> = {
  title: 'Components / ActiveTasksCard',
  component: ActiveTasksCardStatic,
}
export default meta
type Story = StoryObj<typeof ActiveTasksCardStatic>

const sampleRuns: ActiveRun[] = [
  {
    id: '1',
    triggerRunId: 'run_abc123',
    taskType: 'scrape-organization',
    label: 'Scraping example.com',
    status: 'running',
    publicAccessToken: null,
  },
  {
    id: '2',
    triggerRunId: 'run_def456',
    taskType: 'scrape-product',
    label: 'Processing product: Heinz Ketchup',
    status: 'running',
    publicAccessToken: null,
  },
]

export const Running: Story = {
  render: () => <ActiveTasksCardStatic runs={sampleRuns} />,
}

export const MixedStatuses: Story = {
  render: () => (
    <ActiveTasksCardStatic
      runs={[
        ...sampleRuns,
        {
          id: '3',
          triggerRunId: 'run_ghi789',
          taskType: 'scrape-product',
          label: 'Processing product: Coca-Cola 330ml',
          status: 'completed',
          publicAccessToken: null,
        },
        {
          id: '4',
          triggerRunId: 'run_jkl012',
          taskType: 'scrape-product',
          label: 'Processing product: Unknown Item',
          status: 'failed',
          publicAccessToken: null,
        },
      ]}
    />
  ),
}

export const Empty: Story = {
  render: () => <ActiveTasksCardStatic runs={[]} />,
}
