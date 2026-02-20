import { type Meta, type StoryObj } from '@storybook/react'

import { InsightsTab } from './insights-tab'

const meta: Meta<typeof InsightsTab> = {
  title: 'Organization / Tabs / InsightsTab',
  component: InsightsTab,
  parameters: {
    nextjs: { appDirectory: true },
  },
}
export default meta
type Story = StoryObj<typeof InsightsTab>

export const Default: Story = {
  args: {
    organizationId: 'org-1',
  },
}
