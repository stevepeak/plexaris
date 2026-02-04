import { type Meta, type StoryObj } from '@storybook/react'

import { ProductForm } from './product-form'

const meta: Meta<typeof ProductForm> = {
  title: 'Product / ProductForm',
  component: ProductForm,
  decorators: [
    (story) => <div className="mx-auto max-w-4xl p-4">{story()}</div>,
  ],
}
export default meta
type Story = StoryObj<typeof ProductForm>

export const AddProduct: Story = {
  args: {
    onSubmit: async () => ({}),
    onCancel: () => undefined,
  },
}

export const EditProduct: Story = {
  args: {
    product: {
      id: '1',
      name: 'Sourdough Bread',
      description: 'Traditional Dutch sourdough, baked fresh daily.',
      price: '4.50',
      unit: 'piece',
      category: 'Bread',
      status: 'active',
    },
    onSubmit: async () => ({}),
    onCancel: () => undefined,
  },
}

export const EditMinimalProduct: Story = {
  args: {
    product: {
      id: '2',
      name: 'Seasonal Special',
      description: null,
      price: null,
      unit: null,
      category: null,
      status: 'draft',
    },
    onSubmit: async () => ({}),
    onCancel: () => undefined,
  },
}

export const Loading: Story = {
  args: {
    isPending: true,
  },
}

export const WithError: Story = {
  args: {
    onSubmit: async () => ({ error: 'Failed to create product' }),
    onCancel: () => undefined,
  },
}

export const NoCancel: Story = {
  args: {
    onSubmit: async () => ({}),
  },
}
