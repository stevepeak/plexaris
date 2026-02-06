import { type Meta, type StoryObj } from '@storybook/react'

import { UrlStep } from './url-step'

const meta: Meta<typeof UrlStep> = {
  title: 'Onboarding / UrlStep',
  component: UrlStep,
}
export default meta
type Story = StoryObj<typeof UrlStep>

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {}

export const Empty: Story = {
  render: () => (
    <UrlStep urls="" onUrlsChange={noop} onBack={noop} onNext={noop} />
  ),
}

export const Filled: Story = {
  render: () => (
    <UrlStep
      urls={'https://example.com\nhttps://example.com/products'}
      onUrlsChange={noop}
      onBack={noop}
      onNext={noop}
    />
  ),
}
