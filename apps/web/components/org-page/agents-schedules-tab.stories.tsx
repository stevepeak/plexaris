import { type Meta, type StoryObj } from '@storybook/react'

import { AgentsSchedulesTab } from './agents-schedules-tab'

const meta: Meta<typeof AgentsSchedulesTab> = {
  title: 'Organization / Tabs / AgentsSchedulesTab',
  component: AgentsSchedulesTab,
  parameters: {
    nextjs: { appDirectory: true },
  },
}
export default meta
type Story = StoryObj<typeof AgentsSchedulesTab>

export const Default: Story = {
  args: {
    organizationId: 'org-1',
  },
}
