import { type Meta, type StoryObj } from '@storybook/react'

import { OrgProvider } from '@/components/org-context'

import { OrgSidebar } from './org-sidebar'

const noop = () => undefined

const meta: Meta<typeof OrgSidebar> = {
  title: 'Organization / OrgSidebar',
  component: OrgSidebar,
  parameters: {
    nextjs: { appDirectory: true },
  },
  decorators: [
    (story) => (
      <OrgProvider
        org={{
          id: 'org-1',
          name: 'Fresh Foods BV',
          type: 'supplier',
          claimed: true,
          logoUrl: null,
          roleId: 'role-1',
          roleName: 'Admin',
          isAdmin: true,
          permissions: ['manage_roles'],
        }}
        refreshOrg={noop}
      >
        <div className="w-48">{story()}</div>
      </OrgProvider>
    ),
  ],
}
export default meta
type Story = StoryObj<typeof OrgSidebar>

export const Supplier: Story = {}

export const Horeca: Story = {
  decorators: [
    (story) => (
      <OrgProvider
        org={{
          id: 'org-2',
          name: 'Restaurant De Gouden Leeuw',
          type: 'horeca',
          claimed: true,
          logoUrl: null,
          roleId: 'role-2',
          roleName: 'Member',
          isAdmin: false,
          permissions: [],
        }}
        refreshOrg={noop}
      >
        <div className="w-48">{story()}</div>
      </OrgProvider>
    ),
  ],
}
