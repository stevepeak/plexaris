import { type Meta, type StoryObj } from '@storybook/react'

import { CodeViewer } from './code-viewer'

const meta = {
  title: 'Components/CodeViewer',
  component: CodeViewer,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof CodeViewer>

export default meta
type Story = StoryObj<typeof meta>

const sampleTaskOutput = {
  organizationId: '08a5d702-5ae7-40a1-80b6-8372dced1104',
  data: {
    name: 'Acme Fresh Foods',
    type: 'supplier',
    email: 'contact@acmefresh.com',
    phone: '+31 20 123 4567',
    address: 'Dijkgraafplein 25, 1054 Amsterdam',
    deliveryAreas: 'Amsterdam, Rotterdam, The Hague, Utrecht',
  },
  issues: [
    {
      source: 'https://acmefresh.com/about',
      field: 'phone',
      rawValue: 'Call us anytime!',
      error: 'Could not extract valid phone number',
      timestamp: '2025-02-06T10:23:45.000Z',
    },
    {
      source: 'uploaded-file-1.pdf',
      field: 'deliverySchedule',
      rawValue: '',
      error: 'Field not found in document',
      timestamp: '2025-02-06T10:24:12.000Z',
    },
  ],
}

export const Default: Story = {
  args: {
    code: sampleTaskOutput,
    title: 'Task Output',
  },
}

export const WithoutTitle: Story = {
  args: {
    code: sampleTaskOutput,
  },
}

export const StringCode: Story = {
  args: {
    code: JSON.stringify(sampleTaskOutput, null, 2),
    title: 'Raw JSON String',
  },
}

export const SmallData: Story = {
  args: {
    code: { status: 'completed', message: 'Success' },
    title: 'Simple Response',
  },
}

export const LargeData: Story = {
  args: {
    code: {
      ...sampleTaskOutput,
      logs: Array.from({ length: 50 }, (_, i) => ({
        timestamp: new Date(Date.now() - i * 60000).toISOString(),
        level: i % 5 === 0 ? 'error' : i % 3 === 0 ? 'warn' : 'info',
        message: `Log entry ${i + 1}: Processing step ${i + 1} completed`,
      })),
    },
    title: 'Large Dataset',
    maxHeight: 300,
  },
}

export const ErrorOutput: Story = {
  args: {
    code: {
      error: 'TaskExecutionError',
      message: 'Failed to fetch URL: Connection timeout after 30s',
      stack: `Error: Failed to fetch URL: Connection timeout after 30s
    at fetchWithRetry (file:///app/src/utils/fetch.ts:45:11)
    at scrapeUrl (file:///app/src/tasks/scrape.ts:78:22)
    at runTask (file:///app/src/runner.ts:112:9)`,
      metadata: {
        url: 'https://example.com/products',
        retries: 3,
        lastAttempt: '2025-02-06T10:30:00.000Z',
      },
    },
    title: 'Error Details',
  },
}

export const TypeScriptCode: Story = {
  args: {
    code: `interface TaskResult {
  organizationId: string
  data: Record<string, unknown>
  issues: ScrapeIssue[]
}

async function runTask(id: string): Promise<TaskResult> {
  const result = await executeTask(id)
  return result
}`,
    language: 'typescript',
    title: 'TypeScript Example',
  },
}
