import { type Meta, type StoryObj } from '@storybook/react'

import { AppHeader } from './app-header'

const meta: Meta<typeof AppHeader> = {
  title: 'Components/AppHeader',
  component: AppHeader,
  parameters: {
    layout: 'fullscreen',
  },
}

export default meta

type Story = StoryObj<typeof AppHeader>

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {}

const mockOrganizations = [
  {
    id: '1',
    name: 'Acme Supplies',
    type: 'supplier' as const,
    claimed: true,
    logoUrl: null,
    roleId: 'admin',
    roleName: 'Admin',
    isAdmin: true,
    permissions: [],
  },
  {
    id: '2',
    name: 'Best Restaurant',
    type: 'horeca' as const,
    claimed: true,
    logoUrl: null,
    roleId: 'member',
    roleName: 'Member',
    isAdmin: false,
    permissions: [],
  },
]

export const Default: Story = {
  args: {
    organizations: mockOrganizations,
    activeOrg: mockOrganizations[0],
    onSwitchOrg: noop,
    orgsPending: false,
  },
}

export const NoActiveOrg: Story = {
  args: {
    organizations: mockOrganizations,
    activeOrg: null,
    onSwitchOrg: noop,
    orgsPending: false,
  },
}

export const Loading: Story = {
  args: {
    organizations: [],
    activeOrg: null,
    onSwitchOrg: noop,
    orgsPending: true,
  },
}

export const WithSuperAdmin: Story = {
  args: {
    organizations: mockOrganizations,
    activeOrg: mockOrganizations[0],
    onSwitchOrg: noop,
    orgsPending: false,
    superAdmin: true,
  },
}
