import { type Meta, type StoryObj } from '@storybook/react'

import { NotificationSettingsFormFields } from './notification-settings'

const meta: Meta<typeof NotificationSettingsFormFields> = {
  title: 'Organization / Settings / NotificationSettings',
  component: NotificationSettingsFormFields,
  parameters: {
    nextjs: { appDirectory: true },
  },
}
export default meta
type Story = StoryObj<typeof NotificationSettingsFormFields>

const allEnabled = [
  {
    notificationType: 'order_placed' as const,
    email: true,
    sms: true,
  },
  {
    notificationType: 'order_cancelled' as const,
    email: true,
    sms: true,
  },
  {
    notificationType: 'order_returned' as const,
    email: true,
    sms: true,
  },
  {
    notificationType: 'user_invited' as const,
    email: true,
    sms: true,
  },
  {
    notificationType: 'user_accepted_invite' as const,
    email: true,
    sms: true,
  },
  {
    notificationType: 'order_issues' as const,
    email: true,
    sms: true,
  },
  {
    notificationType: 'agent_suggestion_found' as const,
    email: true,
    sms: true,
  },
  {
    notificationType: 'agent_completed' as const,
    email: true,
    sms: true,
  },
]

const mixedPreferences = [
  {
    notificationType: 'order_placed' as const,
    email: true,
    sms: false,
  },
  {
    notificationType: 'order_cancelled' as const,
    email: true,
    sms: true,
  },
  {
    notificationType: 'order_returned' as const,
    email: false,
    sms: false,
  },
  {
    notificationType: 'user_invited' as const,
    email: true,
    sms: true,
  },
  {
    notificationType: 'user_accepted_invite' as const,
    email: false,
    sms: true,
  },
  {
    notificationType: 'order_issues' as const,
    email: true,
    sms: false,
  },
  {
    notificationType: 'agent_suggestion_found' as const,
    email: true,
    sms: true,
  },
  {
    notificationType: 'agent_completed' as const,
    email: false,
    sms: false,
  },
]

const noop = () => undefined

export const AllEnabled: Story = {
  render: () => (
    <NotificationSettingsFormFields
      preferences={allEnabled}
      isPending={false}
      onToggle={noop}
    />
  ),
}

export const MixedPreferences: Story = {
  render: () => (
    <NotificationSettingsFormFields
      preferences={mixedPreferences}
      isPending={false}
      onToggle={noop}
    />
  ),
}

export const Loading: Story = {
  render: () => (
    <NotificationSettingsFormFields
      preferences={[]}
      isPending={true}
      onToggle={noop}
    />
  ),
}
