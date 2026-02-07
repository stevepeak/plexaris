import { type Meta, type StoryObj } from '@storybook/react'

import { type Product, ProductList } from './product-list'

const meta: Meta<typeof ProductList> = {
  title: 'Product / ProductList',
  component: ProductList,
  decorators: [
    (story) => <div className="mx-auto max-w-4xl p-4">{story()}</div>,
  ],
}
export default meta
type Story = StoryObj<typeof ProductList>

const sampleProducts: Product[] = [
  {
    id: '1',
    name: 'Sourdough Bread',
    description: 'Traditional Dutch sourdough',
    price: '4.50',
    unit: 'piece',
    category: 'Bread',
    status: 'active',
    images: [],
    createdAt: '2026-01-15T10:00:00Z',
    updatedAt: '2026-01-15T10:00:00Z',
    archivedAt: null,
  },
  {
    id: '2',
    name: 'Croissants (6-pack)',
    description: 'Butter croissants',
    price: '8.95',
    unit: 'box',
    category: 'Pastry',
    status: 'active',
    images: [],
    createdAt: '2026-01-14T10:00:00Z',
    updatedAt: '2026-01-14T10:00:00Z',
    archivedAt: null,
  },
  {
    id: '3',
    name: 'Whole Wheat Loaf',
    description: 'Freshly baked whole wheat bread',
    price: '3.75',
    unit: 'piece',
    category: 'Bread',
    status: 'draft',
    images: [],
    createdAt: '2026-01-13T10:00:00Z',
    updatedAt: '2026-01-13T10:00:00Z',
    archivedAt: null,
  },
  {
    id: '4',
    name: 'Stroopwafels',
    description: null,
    price: '6.00',
    unit: 'box',
    category: 'Pastry',
    status: 'draft',
    images: [],
    createdAt: '2026-01-12T10:00:00Z',
    updatedAt: '2026-01-12T10:00:00Z',
    archivedAt: null,
  },
  {
    id: '5',
    name: 'Bulk Flour',
    description: 'Premium wheat flour',
    price: '25.00',
    unit: 'kg',
    category: 'Ingredients',
    status: 'active',
    images: [],
    createdAt: '2026-01-11T10:00:00Z',
    updatedAt: '2026-01-11T10:00:00Z',
    archivedAt: null,
  },
]

export const Loading: Story = {
  args: {
    products: [],
    isPending: true,
    isOwner: true,
  },
}

export const GridView: Story = {
  args: {
    products: sampleProducts,
    isPending: false,
    isOwner: true,
    onAddProduct: () => undefined,
  },
}

export const EmptyOwner: Story = {
  args: {
    products: [],
    isPending: false,
    isOwner: true,
    onAddProduct: () => undefined,
  },
}

export const EmptyMember: Story = {
  args: {
    products: [],
    isPending: false,
    isOwner: false,
  },
}

export const MemberView: Story = {
  args: {
    products: sampleProducts,
    isPending: false,
    isOwner: false,
  },
}

export const NoPrices: Story = {
  args: {
    products: [
      {
        id: '1',
        name: 'Custom Order Cake',
        description: 'Made to order',
        price: null,
        unit: null,
        category: 'Custom',
        status: 'active',
        images: [],
        createdAt: '2026-01-15T10:00:00Z',
        updatedAt: '2026-01-15T10:00:00Z',
        archivedAt: null,
      },
      {
        id: '2',
        name: 'Seasonal Special',
        description: null,
        price: null,
        unit: null,
        category: null,
        status: 'draft',
        images: [],
        createdAt: '2026-01-14T10:00:00Z',
        updatedAt: '2026-01-14T10:00:00Z',
        archivedAt: null,
      },
    ],
    isPending: false,
    isOwner: true,
    onAddProduct: () => undefined,
  },
}
