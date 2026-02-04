import { type Meta, type StoryObj } from '@storybook/react'

import { OrgNameStep } from './org-name-step'

const meta: Meta<typeof OrgNameStep> = {
  title: 'Onboarding / OrgNameStep',
  component: OrgNameStep,
}
export default meta
type Story = StoryObj<typeof OrgNameStep>

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {}

export const Empty: Story = {
  render: () => (
    <OrgNameStep
      orgType="supplier"
      name=""
      onNameChange={noop}
      onBack={noop}
      onSubmit={noop}
      isLoading={false}
      error={null}
    />
  ),
}

export const Filled: Story = {
  render: () => (
    <OrgNameStep
      orgType="supplier"
      name="Fresh Foods BV"
      onNameChange={noop}
      onBack={noop}
      onSubmit={noop}
      isLoading={false}
      error={null}
    />
  ),
}

export const Loading: Story = {
  render: () => (
    <OrgNameStep
      orgType="horeca"
      name="Restaurant De Kas"
      onNameChange={noop}
      onBack={noop}
      onSubmit={noop}
      isLoading={true}
      error={null}
    />
  ),
}

export const WithError: Story = {
  render: () => (
    <OrgNameStep
      orgType="horeca"
      name="Restaurant De Kas"
      onNameChange={noop}
      onBack={noop}
      onSubmit={noop}
      isLoading={false}
      error="Failed to create organization"
    />
  ),
}
