import { type Meta, type StoryObj } from '@storybook/react'

import { OrdersTab } from './orders-tab'

const meta: Meta<typeof OrdersTab> = {
  title: 'Organization / Tabs / OrdersTab',
  component: OrdersTab,
  parameters: {
    nextjs: { appDirectory: true },
  },
}
export default meta
type Story = StoryObj<typeof OrdersTab>

export const Default: Story = {
  args: {
    organizationId: 'org-1',
  },
}
