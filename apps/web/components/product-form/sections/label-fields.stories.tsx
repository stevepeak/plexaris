import { type Meta, type StoryObj } from '@storybook/react'

import { LabelFields } from './label-fields'

const meta: Meta<typeof LabelFields> = {
  title: 'Product / ProductForm / Sections / LabelFields',
  component: LabelFields,
  decorators: [
    (story) => <div className="mx-auto max-w-2xl p-4">{story()}</div>,
  ],
}
export default meta
type Story = StoryObj<typeof LabelFields>

export const Default: Story = {
  args: {
    g: () => '',
    u: () => undefined,
    data: {},
    fc: () => undefined,
    undo: () => undefined,
  },
}
