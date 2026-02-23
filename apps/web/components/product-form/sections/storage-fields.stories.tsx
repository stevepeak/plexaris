import { type Meta, type StoryObj } from '@storybook/react'

import { StorageFields } from './storage-fields'

const meta: Meta<typeof StorageFields> = {
  title: 'Product / ProductForm / Sections / StorageFields',
  component: StorageFields,
  decorators: [
    (story) => <div className="mx-auto max-w-2xl p-4">{story()}</div>,
  ],
}
export default meta
type Story = StoryObj<typeof StorageFields>

export const Default: Story = {
  args: {
    g: () => '',
    gn: () => '',
    u: () => undefined,
    fc: () => undefined,
    undo: () => undefined,
  },
}
