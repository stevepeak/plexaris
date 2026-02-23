import { type Meta, type StoryObj } from '@storybook/react'

import { PackagingFields } from './packaging-fields'

const meta: Meta<typeof PackagingFields> = {
  title: 'Product / ProductForm / Sections / PackagingFields',
  component: PackagingFields,
  decorators: [
    (story) => <div className="mx-auto max-w-2xl p-4">{story()}</div>,
  ],
}
export default meta
type Story = StoryObj<typeof PackagingFields>

const noopString = () => ''
const noopUpdate = () => undefined
const noopFc = () => undefined
const noopUndo = () => undefined

export const Unit: Story = {
  args: {
    section: 'unit',
    g: noopString,
    gn: noopString,
    u: noopUpdate,
    weightUnit: 'grams',
    dimUnit: 'mm',
    showUnitsPerCase: false,
    fc: noopFc,
    undo: noopUndo,
  },
}

export const Case: Story = {
  args: {
    section: 'case',
    g: noopString,
    gn: noopString,
    u: noopUpdate,
    weightUnit: 'grams',
    dimUnit: 'mm',
    showUnitsPerCase: true,
    fc: noopFc,
    undo: noopUndo,
  },
}
