import { type Meta, type StoryObj } from '@storybook/react'

import { Dialog, DialogContent } from '@/components/ui/dialog'

import { AlignProgressDialogContent } from './align-progress-dialog'

const meta: Meta<typeof AlignProgressDialogContent> = {
  title: 'Organization / Tabs / AlignProgressDialog',
  component: AlignProgressDialogContent,
  parameters: {
    nextjs: { appDirectory: true },
  },
  decorators: [
    (story) => (
      <Dialog open>
        <DialogContent>{story()}</DialogContent>
      </Dialog>
    ),
  ],
  args: {
    taskId: 'task-1',
    orgId: 'org-1',
  },
}
export default meta
type Story = StoryObj<typeof AlignProgressDialogContent>

export const Running: Story = {
  args: {
    status: 'running',
    latestLog: 'Extracting data from catalog.pdf...',
  },
}

export const Completed: Story = {
  args: {
    status: 'completed',
    latestLog: 'Created 12 suggestions from 3 files',
  },
}

export const Failed: Story = {
  args: {
    status: 'failed',
    latestLog: 'Error: Failed to parse invoice.xlsx',
  },
}
