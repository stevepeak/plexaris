import { type Meta, type StoryObj } from '@storybook/react'

import { DashboardTab } from './dashboard-tab'

const meta: Meta<typeof DashboardTab> = {
  title: 'Organization / Tabs / DashboardTab',
  component: DashboardTab,
  parameters: {
    nextjs: { appDirectory: true },
  },
}
export default meta
type Story = StoryObj<typeof DashboardTab>

export const Supplier: Story = {
  args: {
    organizationId: 'org-1',
    orgName: 'Fresh Foods BV',
    orgType: 'supplier',
    orgRole: 'owner',
  },
}

export const Horeca: Story = {
  args: {
    organizationId: 'org-2',
    orgName: 'Restaurant De Gouden Leeuw',
    orgType: 'horeca',
    orgRole: 'member',
  },
}
