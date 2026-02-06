import { type Meta, type StoryObj } from '@storybook/react'

import { AgentsTab } from './agents-tab'

const meta: Meta<typeof AgentsTab> = {
  title: 'Organization / Tabs / AgentsTab',
  component: AgentsTab,
  parameters: {
    nextjs: { appDirectory: true },
  },
}
export default meta
type Story = StoryObj<typeof AgentsTab>

export const Default: Story = {
  args: {
    organizationId: 'org-1',
  },
}
