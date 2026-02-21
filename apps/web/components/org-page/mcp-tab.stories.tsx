import { type Meta, type StoryObj } from '@storybook/react'

import { McpTab } from './mcp-tab'

const meta: Meta<typeof McpTab> = {
  title: 'Organization / Tabs / McpTab',
  component: McpTab,
  parameters: {
    nextjs: { appDirectory: true },
  },
}
export default meta
type Story = StoryObj<typeof McpTab>

export const Default: Story = {
  args: {
    organizationId: 'org-1',
  },
}
