import { type Meta, type StoryObj } from '@storybook/react'

import { PricingFields } from './pricing-fields'

const meta: Meta<typeof PricingFields> = {
  title: 'Product / ProductForm / Sections / PricingFields',
  component: PricingFields,
  decorators: [
    (story) => <div className="mx-auto max-w-2xl p-4">{story()}</div>,
  ],
}
export default meta
type Story = StoryObj<typeof PricingFields>

export const Default: Story = {
  args: {
    gn: () => '',
    u: () => undefined,
    fc: () => undefined,
    undo: () => undefined,
  },
}
