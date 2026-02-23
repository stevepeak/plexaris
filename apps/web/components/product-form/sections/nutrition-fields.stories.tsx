import { type Meta, type StoryObj } from '@storybook/react'

import { NutritionFields } from './nutrition-fields'

const meta: Meta<typeof NutritionFields> = {
  title: 'Product / ProductForm / Sections / NutritionFields',
  component: NutritionFields,
  decorators: [
    (story) => <div className="mx-auto max-w-2xl p-4">{story()}</div>,
  ],
}
export default meta
type Story = StoryObj<typeof NutritionFields>

export const Default: Story = {
  args: {
    gn: () => '',
    u: () => undefined,
    fc: () => undefined,
    undo: () => undefined,
  },
}
