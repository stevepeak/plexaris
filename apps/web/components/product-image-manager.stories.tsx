import { type Meta, type StoryObj } from '@storybook/react'

import { ProductImageManager } from './product-image-manager'

const meta: Meta<typeof ProductImageManager> = {
  title: 'Product / ProductImageManager',
  component: ProductImageManager,
  decorators: [
    (story) => <div className="mx-auto max-w-md p-4">{story()}</div>,
  ],
}
export default meta
type Story = StoryObj<typeof ProductImageManager>

export const Empty: Story = {
  args: {
    images: [],
    disabled: true,
  },
}

export const WithImages: Story = {
  args: {
    images: [
      'https://placehold.co/400x400/e2e8f0/64748b?text=Bread',
      'https://placehold.co/400x400/e2e8f0/64748b?text=Pastry',
      'https://placehold.co/400x400/e2e8f0/64748b?text=Cake',
    ],
    disabled: true,
  },
}

export const Full: Story = {
  args: {
    images: [
      'https://placehold.co/400x400/e2e8f0/64748b?text=1',
      'https://placehold.co/400x400/e2e8f0/64748b?text=2',
      'https://placehold.co/400x400/e2e8f0/64748b?text=3',
      'https://placehold.co/400x400/e2e8f0/64748b?text=4',
      'https://placehold.co/400x400/e2e8f0/64748b?text=5',
      'https://placehold.co/400x400/e2e8f0/64748b?text=6',
      'https://placehold.co/400x400/e2e8f0/64748b?text=7',
      'https://placehold.co/400x400/e2e8f0/64748b?text=8',
    ],
    max: 8,
    disabled: true,
  },
}
