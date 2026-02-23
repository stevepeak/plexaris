import { type Meta, type StoryObj } from '@storybook/react'

import { AllergensFields } from './allergens-fields'

const meta: Meta<typeof AllergensFields> = {
  title: 'Product / ProductForm / Sections / AllergensFields',
  component: AllergensFields,
  decorators: [
    (story) => <div className="mx-auto max-w-2xl p-4">{story()}</div>,
  ],
}
export default meta
type Story = StoryObj<typeof AllergensFields>

export const Default: Story = {
  args: {
    data: {},
    u: () => undefined,
    fc: () => undefined,
    undo: () => undefined,
  },
}

export const WithValues: Story = {
  args: {
    data: {
      allergens: {
        allergens: {
          gluten: 'contains',
          milk: 'contains',
          eggs: 'may_contain',
          nuts: 'absent',
        },
      },
    },
    u: () => undefined,
    fc: () => undefined,
    undo: () => undefined,
  },
}
