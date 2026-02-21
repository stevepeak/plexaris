import { ALL_PERMISSIONS } from '@app/db/schema'
import { type Meta, type StoryObj } from '@storybook/react'

import { RolesTab } from './roles-tab'

const meta: Meta<typeof RolesTab> = {
  title: 'Organization / RolesTab',
  component: RolesTab,
  parameters: {
    nextjs: { appDirectory: true },
  },
}
export default meta
type Story = StoryObj<typeof RolesTab>

export const Admin: Story = {
  args: {
    organizationId: 'org-1',
    permissions: [...ALL_PERMISSIONS],
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
