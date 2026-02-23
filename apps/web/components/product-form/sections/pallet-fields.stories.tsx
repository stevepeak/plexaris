import { type Meta, type StoryObj } from '@storybook/react'

import { PalletFields } from './pallet-fields'

const meta: Meta<typeof PalletFields> = {
  title: 'Product / ProductForm / Sections / PalletFields',
  component: PalletFields,
  decorators: [
    (story) => <div className="mx-auto max-w-2xl p-4">{story()}</div>,
  ],
}
export default meta
type Story = StoryObj<typeof PalletFields>

export const Default: Story = {
  args: {
    g: () => '',
    gn: () => '',
    u: () => undefined,
    fc: () => undefined,
    undo: () => undefined,
  },
}
