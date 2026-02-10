import { type Meta, type StoryObj } from '@storybook/react'

import { AgentsRunsTab } from './agents-runs-tab'

const meta: Meta<typeof AgentsRunsTab> = {
  title: 'Organization / Tabs / AgentsRunsTab',
  component: AgentsRunsTab,
  parameters: {
    nextjs: { appDirectory: true },
  },
}
export default meta
type Story = StoryObj<typeof AgentsRunsTab>

export const Default: Story = {
  args: {
    organizationId: 'org-1',
  },
}
