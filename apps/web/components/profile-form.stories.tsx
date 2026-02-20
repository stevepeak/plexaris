import { type Meta, type StoryObj } from '@storybook/react'

import { type OrgMembership, ProfileFormFields } from './profile-form'

const meta: Meta<typeof ProfileFormFields> = {
  title: 'Profile / ProfileFormFields',
  component: ProfileFormFields,
  parameters: {
    nextjs: { appDirectory: true },
  },
}
export default meta
type Story = StoryObj<typeof ProfileFormFields>

const noop = () => Promise.resolve({})

const sampleOrgs: OrgMembership[] = [
  { id: '1', name: 'Acme Corp', role: 'owner', soleOwner: true },
  { id: '2', name: 'Side Project', role: 'member', soleOwner: false },
]

export const Default: Story = {
  render: () => (
    <ProfileFormFields
      name="Demo User"
      email="demo@plexaris.com"
      isPending={false}
      onUpdateName={noop}
      onUpdatePhone={noop}
      onChangePassword={noop}
      onDeleteAccount={noop}
      organizations={sampleOrgs}
      organizationsLoading={false}
      onLeaveOrg={noop}
      onArchiveOrg={noop}
    />
  ),
}

export const WithAvatar: Story = {
  render: () => (
    <ProfileFormFields
      name="Demo User"
      email="demo@plexaris.com"
      image="https://github.com/shadcn.png"
      isPending={false}
      onUpdateName={noop}
      onUpdateImage={async () => ({})}
      onUpdatePhone={noop}
      onChangePassword={noop}
      onDeleteAccount={noop}
      organizations={sampleOrgs}
      organizationsLoading={false}
      onLeaveOrg={noop}
      onArchiveOrg={noop}
    />
  ),
}

export const WithPhoneNumber: Story = {
  render: () => (
    <ProfileFormFields
      name="Demo User"
      email="demo@plexaris.com"
      phone="+1 (555) 123-4567"
      contactPreference="call"
      isPending={false}
      onUpdateName={noop}
      onUpdatePhone={noop}
      onChangePassword={noop}
      onDeleteAccount={noop}
      organizations={[]}
      organizationsLoading={false}
      onLeaveOrg={noop}
      onArchiveOrg={noop}
    />
  ),
}

export const Loading: Story = {
  render: () => <ProfileFormFields name="" email="" isPending={true} />,
}

export const ReadOnly: Story = {
  render: () => (
    <ProfileFormFields
      name="Demo User"
      email="demo@plexaris.com"
      isPending={false}
    />
  ),
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
const voidNoop = () => {}

export const WithPasskeys: Story = {
  render: () => (
    <ProfileFormFields
      name="Demo User"
      email="demo@plexaris.com"
      isPending={false}
      onUpdateName={noop}
      onChangePassword={noop}
      onDeleteAccount={noop}
      organizations={[]}
      organizationsLoading={false}
      onLeaveOrg={noop}
      onArchiveOrg={noop}
      passkeys={[
        {
          id: '1',
          name: 'Mac',
          aaguid: 'bada5566-a7aa-401f-bd96-45619a55120d',
          createdAt: '2026-01-15T10:30:00Z',
        },
        {
          id: '2',
          name: 'iPhone',
          aaguid: 'fbfc3007-154e-4ecc-8c0b-6e020557d7bd',
          createdAt: '2026-02-01T14:00:00Z',
        },
      ]}
      passkeysLoading={false}
      onAddPasskey={voidNoop}
      onDeletePasskey={voidNoop}
    />
  ),
}

export const NoPasskeys: Story = {
  render: () => (
    <ProfileFormFields
      name="Demo User"
      email="demo@plexaris.com"
      isPending={false}
      onUpdateName={noop}
      onChangePassword={noop}
      onDeleteAccount={noop}
      organizations={[]}
      organizationsLoading={false}
      onLeaveOrg={noop}
      onArchiveOrg={noop}
      passkeys={[]}
      passkeysLoading={false}
      onAddPasskey={voidNoop}
      onDeletePasskey={voidNoop}
    />
  ),
}

export const PasskeysLoading: Story = {
  render: () => (
    <ProfileFormFields
      name="Demo User"
      email="demo@plexaris.com"
      isPending={false}
      onUpdateName={noop}
      onChangePassword={noop}
      onDeleteAccount={noop}
      organizations={[]}
      organizationsLoading={false}
      onLeaveOrg={noop}
      onArchiveOrg={noop}
      passkeysLoading={true}
      onAddPasskey={voidNoop}
      onDeletePasskey={voidNoop}
    />
  ),
}

export const DangerZoneWithOrgs: Story = {
  render: () => (
    <ProfileFormFields
      name="Demo User"
      email="demo@plexaris.com"
      isPending={false}
      onUpdateName={noop}
      onChangePassword={noop}
      onDeleteAccount={noop}
      organizations={sampleOrgs}
      organizationsLoading={false}
      onLeaveOrg={noop}
      onArchiveOrg={noop}
    />
  ),
}

export const DangerZoneSoleOwnerOnly: Story = {
  render: () => (
    <ProfileFormFields
      name="Demo User"
      email="demo@plexaris.com"
      isPending={false}
      onUpdateName={noop}
      onChangePassword={noop}
      onDeleteAccount={noop}
      organizations={[
        { id: '1', name: 'Acme Corp', role: 'owner', soleOwner: true },
        { id: '3', name: 'Personal Workspace', role: 'owner', soleOwner: true },
      ]}
      organizationsLoading={false}
      onLeaveOrg={noop}
      onArchiveOrg={noop}
    />
  ),
}

export const DangerZoneNoOrgs: Story = {
  render: () => (
    <ProfileFormFields
      name="Demo User"
      email="demo@plexaris.com"
      isPending={false}
      onUpdateName={noop}
      onChangePassword={noop}
      onDeleteAccount={noop}
      organizations={[]}
      organizationsLoading={false}
      onLeaveOrg={noop}
      onArchiveOrg={noop}
    />
  ),
}

export const DangerZoneOrgsLoading: Story = {
  render: () => (
    <ProfileFormFields
      name="Demo User"
      email="demo@plexaris.com"
      isPending={false}
      onUpdateName={noop}
      onChangePassword={noop}
      onDeleteAccount={noop}
      organizationsLoading={true}
      onLeaveOrg={noop}
      onArchiveOrg={noop}
    />
  ),
}
