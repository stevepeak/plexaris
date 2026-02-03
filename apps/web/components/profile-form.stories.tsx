import { type Meta, type StoryObj } from '@storybook/react'

import { ProfileFormFields } from './profile-form'

const meta: Meta<typeof ProfileFormFields> = {
  title: 'components/ProfileFormFields',
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
