import { type Meta, type StoryObj } from '@storybook/react'

import { IngredientsFields } from './ingredients-fields'

const meta: Meta<typeof IngredientsFields> = {
  title: 'Product / ProductForm / Sections / IngredientsFields',
  component: IngredientsFields,
  decorators: [
    (story) => <div className="mx-auto max-w-2xl p-4">{story()}</div>,
  ],
}
export default meta
type Story = StoryObj<typeof IngredientsFields>

export const Default: Story = {
  args: {
    g: () => '',
    gn: () => '',
    u: () => undefined,
    fc: () => undefined,
    undo: () => undefined,
  },
}
