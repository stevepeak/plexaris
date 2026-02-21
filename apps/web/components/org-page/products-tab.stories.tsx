import { type Meta, type StoryObj } from '@storybook/react'

import { ProductsTab } from './products-tab'

const meta: Meta<typeof ProductsTab> = {
  title: 'Organization / Tabs / ProductsTab',
  component: ProductsTab,
  parameters: {
    nextjs: { appDirectory: true },
  },
}
export default meta
type Story = StoryObj<typeof ProductsTab>

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
  },
}

export const Member: Story = {
  args: {
    organizationId: 'org-1',
    permissions: ['create_order', 'edit_order', 'place_order'],
  },
}
