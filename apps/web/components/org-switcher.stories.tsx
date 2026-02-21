import { type Meta, type StoryObj } from '@storybook/react'

import { OrgSwitcher } from './org-switcher'

const meta: Meta<typeof OrgSwitcher> = {
  title: 'Organization / Switcher / OrgSwitcher',
  component: OrgSwitcher,
  parameters: {
    nextjs: { appDirectory: true },
  },
}
export default meta
type Story = StoryObj<typeof OrgSwitcher>

const sampleOrgs = [
  {
    id: '1',
    name: 'Fresh Foods BV',
    type: 'supplier' as const,
    claimed: true,
    logoUrl: null,
    roleId: 'role-1',
    roleName: 'Admin',
    isAdmin: true,
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
  {
    id: '2',
    name: 'Restaurant De Gouden Leeuw',
    type: 'horeca' as const,
    claimed: true,
    logoUrl: null,
    roleId: 'role-2',
    roleName: 'Member',
    isAdmin: false,
    permissions: ['create_order', 'edit_order', 'place_order'],
  },
  {
    id: '3',
    name: 'Bakkerij Jansen',
    type: 'supplier' as const,
    claimed: true,
    logoUrl: 'https://placehold.co/64x64/orange/white?text=BJ',
    roleId: 'role-1',
    roleName: 'Admin',
    isAdmin: true,
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
]

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {}

export const Default: Story = {
  render: () => (
    <OrgSwitcher
      organizations={sampleOrgs}
      activeOrg={sampleOrgs[0]!}
      onSwitch={noop}
      isPending={false}
    />
  ),
}

export const SingleOrg: Story = {
  render: () => (
    <OrgSwitcher
      organizations={[sampleOrgs[0]!]}
      activeOrg={sampleOrgs[0]!}
      onSwitch={noop}
      isPending={false}
    />
  ),
}

export const Loading: Story = {
  render: () => (
    <OrgSwitcher
      organizations={[]}
      activeOrg={null}
      onSwitch={noop}
      isPending={true}
    />
  ),
}
