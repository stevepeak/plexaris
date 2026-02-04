import { type Meta, type StoryObj } from '@storybook/react'

import { InviteMembersList } from './invite-members'

const meta: Meta<typeof InviteMembersList> = {
  title: 'Organization / Members / InviteMembersList',
  component: InviteMembersList,
  parameters: {
    nextjs: { appDirectory: true },
  },
}
export default meta
type Story = StoryObj<typeof InviteMembersList>

const sampleInvitations = [
  {
    id: '1',
    email: 'alice@company.com',
    role: 'member',
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(),
    acceptedAt: null,
    rejectedAt: null,
    invitedByName: 'Demo User',
  },
  {
    id: '2',
    email: 'bob@company.com',
    role: 'member',
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    expiresAt: new Date(Date.now() + 4 * 86400000).toISOString(),
    acceptedAt: new Date().toISOString(),
    rejectedAt: null,
    invitedByName: 'Demo User',
  },
  {
    id: '3',
    email: 'carol@company.com',
    role: 'owner',
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    expiresAt: new Date(Date.now() + 2 * 86400000).toISOString(),
    acceptedAt: null,
    rejectedAt: new Date().toISOString(),
    invitedByName: 'Demo User',
  },
  {
    id: '4',
    email: 'dave@company.com',
    role: 'member',
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    expiresAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    acceptedAt: null,
    rejectedAt: null,
    invitedByName: 'Demo User',
  },
]

const noop = async () => ({})

export const WithInvitations: Story = {
  render: () => (
    <InviteMembersList
      invitations={sampleInvitations}
      isOwner={true}
      isPending={false}
      onInvite={noop}
    />
  ),
}

export const Empty: Story = {
  render: () => (
    <InviteMembersList
      invitations={[]}
      isOwner={true}
      isPending={false}
      onInvite={noop}
    />
  ),
}

export const MemberView: Story = {
  render: () => (
    <InviteMembersList
      invitations={sampleInvitations}
      isOwner={false}
      isPending={false}
    />
  ),
}

export const Loading: Story = {
  render: () => (
    <InviteMembersList
      invitations={[]}
      isOwner={true}
      isPending={true}
      onInvite={noop}
    />
  ),
}
