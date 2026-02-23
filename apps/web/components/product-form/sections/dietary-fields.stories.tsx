import { type Meta, type StoryObj } from '@storybook/react'

import { DietaryFields } from './dietary-fields'

const meta: Meta<typeof DietaryFields> = {
  title: 'Product / ProductForm / Sections / DietaryFields',
  component: DietaryFields,
  decorators: [
    (story) => <div className="mx-auto max-w-2xl p-4">{story()}</div>,
  ],
}
export default meta
type Story = StoryObj<typeof DietaryFields>

export const NoneSelected: Story = {
  args: {
    data: {},
    u: () => undefined,
    fc: () => undefined,
    undo: () => undefined,
  },
}

export const AllSelected: Story = {
  args: {
    data: {
      dietary: {
        kosher: true,
        halal: true,
        vegetarian: true,
        vegan: true,
      },
    },
    u: () => undefined,
    fc: () => undefined,
    undo: () => undefined,
  },
}
