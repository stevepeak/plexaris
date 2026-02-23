import { type Meta, type StoryObj } from '@storybook/react'

import { AuditTab } from './audit-tab'

const meta: Meta<typeof AuditTab> = {
  title: 'Organization / Tabs / AuditTab',
  component: AuditTab,
  parameters: {
    nextjs: { appDirectory: true },
  },
}
export default meta
type Story = StoryObj<typeof AuditTab>

export const Default: Story = {
  args: {
    organizationId: 'org-1',
  },
}
