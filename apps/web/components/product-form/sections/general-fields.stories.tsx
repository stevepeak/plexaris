import { type Meta, type StoryObj } from '@storybook/react'

import { GeneralFields } from './general-fields'

const meta: Meta<typeof GeneralFields> = {
  title: 'Product / ProductForm / Sections / GeneralFields',
  component: GeneralFields,
  decorators: [
    (story) => <div className="mx-auto max-w-2xl p-4">{story()}</div>,
  ],
}
export default meta
type Story = StoryObj<typeof GeneralFields>

const noopString = () => ''
const noopUpdate = () => undefined
const noopFc = () => undefined
const noopUndo = () => undefined

export const Default: Story = {
  args: {
    g: noopString,
    u: noopUpdate,
    fc: noopFc,
    undo: noopUndo,
  },
}

export const WithValues: Story = {
  args: {
    g: (p: string[]) => {
      const map: Record<string, string> = {
        'general.brand': 'BioFresh',
        'general.variant': 'Original',
        'general.description': 'Premium cold-pressed orange juice',
        'general.articleNumber': 'BF-OJ-001',
        'general.intrastatCode': '20091100',
        'general.countryOfOrigin': 'NL',
      }
      return map[p.join('.')] ?? ''
    },
    u: noopUpdate,
    fc: noopFc,
    undo: noopUndo,
  },
}
