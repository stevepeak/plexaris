import { type Meta, type StoryObj } from '@storybook/react'

import { ActiveTaskRow } from './active-task-row'

const meta: Meta<typeof ActiveTaskRow> = {
  title: 'Components / ActiveTaskRow',
  component: ActiveTaskRow,
  parameters: {
    nextjs: { appDirectory: true },
  },
  decorators: [
    (story) => <div className="w-[600px] border rounded-lg">{story()}</div>,
  ],
}
export default meta
type Story = StoryObj<typeof ActiveTaskRow>

export const Running: Story = {
  args: {
    run: {
      id: 'run-1',
      triggerRunId: 'trigger-1',
      taskType: 'scrape',
      label: 'Scraping supplier catalog',
      status: 'running',
      creator: { name: 'Alice', image: null },
      createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
      publicAccessToken: null,
    },
  },
}

export const Completed: Story = {
  args: {
    run: {
      id: 'run-2',
      triggerRunId: 'trigger-2',
      taskType: 'scrape',
      label: 'Import product prices',
      status: 'completed',
      creator: { name: 'Bob', image: null },
      createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      publicAccessToken: null,
    },
  },
}

export const Failed: Story = {
  args: {
    run: {
      id: 'run-3',
      triggerRunId: 'trigger-3',
      taskType: 'scrape',
      label: 'Sync inventory levels',
      status: 'failed',
      creator: null,
      createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      publicAccessToken: null,
    },
  },
}

export const NoCreator: Story = {
  args: {
    run: {
      id: 'run-4',
      triggerRunId: 'trigger-4',
      taskType: 'scheduled',
      label: 'Scheduled price check',
      status: 'running',
      creator: null,
      createdAt: new Date(Date.now() - 60 * 1000).toISOString(),
      publicAccessToken: null,
    },
  },
}
