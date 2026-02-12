import { type Meta, type StoryObj } from '@storybook/react'

import { type FieldChange } from '@/hooks/use-product-changes'

import { ProductChangesPopover } from './product-changes-popover'

const meta: Meta<typeof ProductChangesPopover> = {
  title: 'Product / ProductChangesPopover',
  component: ProductChangesPopover,
  decorators: [
    (story) => <div className="flex justify-center p-8">{story()}</div>,
  ],
}
export default meta
type Story = StoryObj<typeof ProductChangesPopover>

const sampleChanges: FieldChange[] = [
  {
    key: 'name',
    path: ['name'],
    label: 'Name',
    originalValue: 'Sourdough Bread',
    currentValue: 'Sourdough Loaf',
    type: 'top-level',
  },
  {
    key: 'general.brand',
    path: ['general', 'brand'],
    label: 'General \u2192 Brand',
    originalValue: 'BioFresh',
    currentValue: 'OrganicCo',
    type: 'data',
  },
  {
    key: 'unit.weight.gross',
    path: ['unit', 'weight', 'gross'],
    label: 'Unit \u2192 Gross',
    originalValue: 1050,
    currentValue: 1100,
    type: 'data',
  },
  {
    key: 'dietary.vegan',
    path: ['dietary', 'vegan'],
    label: 'Dietary \u2192 Vegan',
    originalValue: false,
    currentValue: true,
    type: 'data',
  },
  {
    key: 'allergens.allergens.gluten',
    path: ['allergens', 'allergens', 'gluten'],
    label: 'Allergens \u2192 Gluten',
    originalValue: 'absent',
    currentValue: 'contains',
    type: 'data',
  },
]

export const Default: Story = {
  args: {
    changes: sampleChanges,
    onUndo: () => undefined,
    onNavigate: () => undefined,
  },
}

export const SingleChange: Story = {
  args: {
    changes: [sampleChanges[0]],
    onUndo: () => undefined,
    onNavigate: () => undefined,
  },
}

export const ManyChanges: Story = {
  args: {
    changes: [
      ...sampleChanges,
      {
        key: 'general.variant',
        path: ['general', 'variant'],
        label: 'General \u2192 Variant',
        originalValue: '',
        currentValue: 'Whole Wheat',
        type: 'data',
      },
      {
        key: 'storage.storageType',
        path: ['storage', 'storageType'],
        label: 'Storage & Shelf Life \u2192 Storage type',
        originalValue: 'ambient',
        currentValue: 'chilled',
        type: 'data',
      },
      {
        key: 'pricing.exWorksPerUnit',
        path: ['pricing', 'exWorksPerUnit'],
        label: 'Pricing \u2192 Ex Works / unit',
        originalValue: 2.1,
        currentValue: 2.5,
        type: 'data',
      },
    ],
    onUndo: () => undefined,
    onNavigate: () => undefined,
  },
}

export const NoChanges: Story = {
  args: {
    changes: [],
    onUndo: () => undefined,
    onNavigate: () => undefined,
  },
}
