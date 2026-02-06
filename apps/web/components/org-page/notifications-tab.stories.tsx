import { type Meta, type StoryObj } from '@storybook/react'

import { NotificationsTab } from './notifications-tab'

const meta: Meta<typeof NotificationsTab> = {
  title: 'Organization / Tabs / NotificationsTab',
  component: NotificationsTab,
  parameters: {
    nextjs: { appDirectory: true },
  },
}
export default meta
type Story = StoryObj<typeof NotificationsTab>

export const Default: Story = {
  args: {
    organizationId: 'org-1',
  },
}
