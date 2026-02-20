import { type Meta, type StoryObj } from '@storybook/react'

import { ProfileFormFields } from './profile-form'

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

export const Default: Story = {
  render: () => (
    <ProfileFormFields
      name="Demo User"
      email="demo@plexaris.com"
      isPending={false}
      onUpdateName={noop}
      onChangePassword={noop}
      onArchiveAccount={noop}
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
      onChangePassword={noop}
      onArchiveAccount={noop}
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
      onArchiveAccount={noop}
      passkeys={[
        {
          id: '1',
          name: 'MacBook Pro',
          createdAt: '2026-01-15T10:30:00Z',
        },
        { id: '2', name: 'iPhone', createdAt: '2026-02-01T14:00:00Z' },
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
      onArchiveAccount={noop}
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
      onArchiveAccount={noop}
      passkeysLoading={true}
      onAddPasskey={voidNoop}
      onDeletePasskey={voidNoop}
    />
  ),
}
