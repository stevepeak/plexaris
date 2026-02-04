import { type Meta, type StoryObj } from '@storybook/react'

import { ImageUpload } from './image-upload'

const meta: Meta<typeof ImageUpload> = {
  title: 'UI / ImageUpload',
  component: ImageUpload,
  parameters: {
    nextjs: { appDirectory: true },
  },
}
export default meta
type Story = StoryObj<typeof ImageUpload>

const noop = async () => ({})

export const CircleEmpty: Story = {
  render: () => <ImageUpload fallback="DU" variant="circle" onUpload={noop} />,
}

export const CircleWithImage: Story = {
  render: () => (
    <ImageUpload
      value="https://github.com/shadcn.png"
      fallback="DU"
      variant="circle"
      alt="Demo User"
      onUpload={noop}
    />
  ),
}

export const SquareEmpty: Story = {
  render: () => <ImageUpload fallback="FF" variant="square" onUpload={noop} />,
}

export const SquareWithImage: Story = {
  render: () => (
    <ImageUpload
      value="https://placehold.co/100x100?text=FF"
      fallback="FF"
      variant="square"
      alt="Fresh Foods"
      onUpload={noop}
    />
  ),
}

export const Disabled: Story = {
  render: () => (
    <ImageUpload
      value="https://github.com/shadcn.png"
      fallback="DU"
      variant="circle"
      disabled
    />
  ),
}

export const DisabledSquare: Story = {
  render: () => <ImageUpload fallback="FF" variant="square" disabled />,
}
