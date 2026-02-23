import { type Meta, type StoryObj } from '@storybook/react'

import { PhotosFields } from './photos-fields'

const meta: Meta<typeof PhotosFields> = {
  title: 'Product / ProductForm / Sections / PhotosFields',
  component: PhotosFields,
  decorators: [
    (story) => <div className="mx-auto max-w-2xl p-4">{story()}</div>,
  ],
}
export default meta
type Story = StoryObj<typeof PhotosFields>

export const Empty: Story = {
  args: {
    data: {},
    u: () => undefined,
  },
}

export const WithImages: Story = {
  args: {
    data: {
      photos: {
        images: [
          'https://placehold.co/200x200/orange/white?text=Product+1',
          'https://placehold.co/200x200/green/white?text=Product+2',
        ],
      },
    },
    u: () => undefined,
  },
}
