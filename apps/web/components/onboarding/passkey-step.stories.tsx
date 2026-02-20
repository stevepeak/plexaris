import { type Meta, type StoryObj } from '@storybook/react'

import { PasskeyStep } from './passkey-step'

const meta: Meta<typeof PasskeyStep> = {
  title: 'Onboarding / PasskeyStep',
  component: PasskeyStep,
}
export default meta
type Story = StoryObj<typeof PasskeyStep>

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {}

export const Default: Story = {
  render: () => (
    <PasskeyStep onSetup={noop} onSkip={noop} isLoading={false} error={null} />
  ),
}

export const Loading: Story = {
  render: () => (
    <PasskeyStep onSetup={noop} onSkip={noop} isLoading={true} error={null} />
  ),
}

export const WithError: Story = {
  render: () => (
    <PasskeyStep
      onSetup={noop}
      onSkip={noop}
      isLoading={false}
      error="Your device does not support passkeys"
    />
  ),
}
