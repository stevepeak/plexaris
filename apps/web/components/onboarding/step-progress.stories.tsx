import { type Meta, type StoryObj } from '@storybook/react'

import { StepProgress } from './step-progress'

const meta: Meta<typeof StepProgress> = {
  title: 'Onboarding / StepProgress',
  component: StepProgress,
}
export default meta
type Story = StoryObj<typeof StepProgress>

const twoSteps = [
  { id: 'type', label: 'Type' },
  { id: 'name', label: 'Name' },
]

const fourSteps = [
  { id: 'type', label: 'Type' },
  { id: 'details', label: 'Details' },
  { id: 'address', label: 'Address' },
  { id: 'confirm', label: 'Confirm' },
]

export const TwoStepsFirst: Story = {
  render: () => <StepProgress steps={twoSteps} currentStepIndex={0} />,
}

export const TwoStepsSecond: Story = {
  render: () => <StepProgress steps={twoSteps} currentStepIndex={1} />,
}

export const FourStepsFirst: Story = {
  render: () => <StepProgress steps={fourSteps} currentStepIndex={0} />,
}

export const FourStepsThird: Story = {
  render: () => <StepProgress steps={fourSteps} currentStepIndex={2} />,
}
