import { type Meta, type StoryObj } from '@storybook/react'

import { MembersTab } from './members-tab'

const meta: Meta<typeof MembersTab> = {
  title: 'Organization / Tabs / TeamTab',
  component: MembersTab,
  parameters: {
    nextjs: { appDirectory: true },
  },
}
export default meta
type Story = StoryObj<typeof MembersTab>

export const Owner: Story = {
  args: {
    organizationId: 'org-1',
    isOwner: true,
  },
}

export const Member: Story = {
  args: {
    organizationId: 'org-1',
    isOwner: false,
  },
}
