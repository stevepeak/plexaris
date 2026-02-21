import { type Meta, type StoryObj } from '@storybook/react'

import { PendingInvitationsList } from './pending-invitations'

const meta: Meta<typeof PendingInvitationsList> = {
  title: 'Organization / Members / PendingInvitationsList',
  component: PendingInvitationsList,
  parameters: {
    nextjs: { appDirectory: true },
  },
}
export default meta
type Story = StoryObj<typeof PendingInvitationsList>

const sampleInvitations = [
  {
    id: '1',
    email: 'demo@plexaris.com',
    roleName: 'Member',
    token: 'token-1',
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(),
    organizationName: 'Fresh Foods BV',
    organizationType: 'supplier',
    invitedByName: 'Alice Johnson',
  },
  {
    id: '2',
    email: 'demo@plexaris.com',
    roleName: 'Member',
    token: 'token-2',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    expiresAt: new Date(Date.now() + 5 * 86400000).toISOString(),
    organizationName: 'Restaurant De Kas',
    organizationType: 'horeca',
    invitedByName: 'Bob Smith',
  },
]

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {}

export const WithInvitations: Story = {
  render: () => (
    <PendingInvitationsList
      invitations={sampleInvitations}
      onAccept={noop}
      onReject={noop}
    />
  ),
}

export const SingleInvitation: Story = {
  render: () => (
    <PendingInvitationsList
      invitations={[sampleInvitations[0]!]}
      onAccept={noop}
      onReject={noop}
    />
  ),
}
