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
    permissions: [
      'create_order',
      'edit_order',
      'place_order',
      'invite_members',
      'manage_roles',
      'manage_agents',
      'manage_products',
      'edit_org_details',
    ],
    isAdmin: true,
  },
}

export const Member: Story = {
  args: {
    organizationId: 'org-1',
    permissions: ['create_order', 'edit_order', 'place_order'],
    isAdmin: false,
  },
}
