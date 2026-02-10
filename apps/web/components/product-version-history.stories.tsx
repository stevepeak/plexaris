import { type Meta, type StoryObj } from '@storybook/react'

import {
  type ProductVersionEntry,
  ProductVersionHistory,
} from './product-version-history'

const meta: Meta<typeof ProductVersionHistory> = {
  title: 'Product / ProductVersionHistory',
  component: ProductVersionHistory,
  decorators: [
    (story) => <div className="mx-auto max-w-4xl p-4">{story()}</div>,
  ],
}
export default meta
type Story = StoryObj<typeof ProductVersionHistory>

const mockVersions: ProductVersionEntry[] = [
  {
    id: 'v3',
    version: 3,
    name: 'Sourdough Bread',
    description: 'Traditional Dutch sourdough, baked fresh daily.',
    price: '5.00',
    unit: 'piece',
    category: 'Bread',
    images: [],
    note: 'Increased price for 2025',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    editedBy: { id: 'u1', name: 'Jan de Bakker' },
  },
  {
    id: 'v2',
    version: 2,
    name: 'Sourdough Bread',
    description: 'Traditional Dutch sourdough, baked fresh daily.',
    price: '4.50',
    unit: 'piece',
    category: 'Bread',
    images: [],
    note: 'Added description',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    editedBy: { id: 'u2', name: 'Pieter Smit' },
  },
  {
    id: 'v1',
    version: 1,
    name: 'Sourdough Bread',
    description: null,
    price: '4.50',
    unit: 'piece',
    category: 'Bread',
    images: [],
    note: null,
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    editedBy: { id: 'u1', name: 'Jan de Bakker' },
  },
]

export const Default: Story = {
  args: {
    productId: 'p1',
    currentVersionId: 'v3',
    versions: mockVersions,
    onBack: () => undefined,
  },
}

export const Empty: Story = {
  args: {
    productId: 'p1',
    versions: [],
    onBack: () => undefined,
  },
}

export const SingleVersion: Story = {
  args: {
    productId: 'p1',
    currentVersionId: 'v1',
    versions: [mockVersions[2]],
    onBack: () => undefined,
  },
}
