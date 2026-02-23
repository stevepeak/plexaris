import { type Meta, type StoryObj } from '@storybook/react'

import { DangerZoneTab } from './danger-zone-tab'

const meta: Meta<typeof DangerZoneTab> = {
  title: 'Profile / DangerZoneTab',
  component: DangerZoneTab,
}
export default meta
type Story = StoryObj<typeof DangerZoneTab>

const noop = () => Promise.resolve({})

export const NoOrgs: Story = {
  args: {
    organizations: [],
    organizationsLoading: false,
    onLeaveOrg: noop,
    onArchiveOrg: noop,
    onDeleteAccount: noop,
  },
}

export const WithOrgs: Story = {
  args: {
    organizations: [
      {
        id: '1',
        name: 'Acme Corp',
        roleName: 'Admin',
        isAdmin: true,
        soleAdmin: true,
      },
      {
        id: '2',
        name: 'Side Project',
        roleName: 'Member',
        isAdmin: false,
        soleAdmin: false,
      },
    ],
    organizationsLoading: false,
    onLeaveOrg: noop,
    onArchiveOrg: noop,
    onDeleteAccount: noop,
  },
}

export const OrgsLoading: Story = {
  args: {
    organizationsLoading: true,
    onLeaveOrg: noop,
    onArchiveOrg: noop,
    onDeleteAccount: noop,
  },
}
