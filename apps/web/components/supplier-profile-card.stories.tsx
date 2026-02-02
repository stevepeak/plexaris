import { type Meta, type StoryObj } from '@storybook/react'

import { SupplierProfileCard } from './supplier-profile-card'

const meta: Meta<typeof SupplierProfileCard> = {
  title: 'SupplierProfileCard',
  component: SupplierProfileCard,
  decorators: [
    (story) => (
      <div className="flex min-h-[600px] items-center justify-center p-4">
        {story()}
      </div>
    ),
  ],
}
export default meta
type Story = StoryObj<typeof SupplierProfileCard>

const sampleSupplier = {
  id: '1',
  name: 'Bakkerij de Gouden Korst',
  type: 'supplier',
  status: 'claimed',
  description:
    'Artisan bakery specializing in sourdough breads and traditional Dutch pastries. Supplying fresh baked goods to hotels and restaurants since 1987.',
  logoUrl: null,
  phone: '+31 20 555 1234',
  email: 'info@goudenkorst.nl',
  address: 'Prinsengracht 42, 1015 DK Amsterdam',
}

export const Loading: Story = {
  args: {
    state: { status: 'loading' },
  },
}

export const FullProfile: Story = {
  args: {
    state: { status: 'loaded', supplier: sampleSupplier },
  },
}

export const UnclaimedProfile: Story = {
  args: {
    state: {
      status: 'loaded',
      supplier: { ...sampleSupplier, status: 'unclaimed' },
    },
  },
}

export const MinimalProfile: Story = {
  args: {
    state: {
      status: 'loaded',
      supplier: {
        id: '2',
        name: 'Simple Supplies B.V.',
        type: 'supplier',
        status: 'claimed',
        description: null,
        logoUrl: null,
        phone: null,
        email: null,
        address: null,
      },
    },
  },
}

export const Error: Story = {
  args: {
    state: { status: 'error', message: 'Supplier not found' },
  },
}
