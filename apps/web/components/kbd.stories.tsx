import { type Meta, type StoryObj } from '@storybook/react'

import { Kbd } from './kbd'

const meta: Meta<typeof Kbd> = {
  title: 'Components / Kbd',
  component: Kbd,
}
export default meta
type Story = StoryObj<typeof Kbd>

export const SingleKey: Story = {
  args: {
    children: 'K',
  },
}

export const ModifierKey: Story = {
  args: {
    children: '⌘',
  },
}

export const KeyCombination: Story = {
  render: () => (
    <div className="flex items-center gap-1">
      <Kbd>⌘</Kbd>
      <Kbd>K</Kbd>
    </div>
  ),
}

export const WithCustomClass: Story = {
  args: {
    children: 'Esc',
    className: 'text-muted-foreground',
  },
}
