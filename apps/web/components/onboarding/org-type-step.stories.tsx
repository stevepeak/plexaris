import { type Meta, type StoryObj } from '@storybook/react'

import { OrgTypeStep } from './org-type-step'

const meta: Meta<typeof OrgTypeStep> = {
  title: 'components/onboarding/OrgTypeStep',
  component: OrgTypeStep,
}
export default meta
type Story = StoryObj<typeof OrgTypeStep>

export const Default: Story = {
  render: () => <OrgTypeStep selected={null} onSelect={() => undefined} />,
}

export const SupplierSelected: Story = {
  render: () => <OrgTypeStep selected="supplier" onSelect={() => undefined} />,
}

export const HorecaSelected: Story = {
  render: () => <OrgTypeStep selected="horeca" onSelect={() => undefined} />,
}
