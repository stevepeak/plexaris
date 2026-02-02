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
  deliveryAreas: 'Amsterdam, Haarlem, Utrecht, Rotterdam',
}

const sampleProducts = [
  {
    id: 'p1',
    name: 'Artisan Sourdough Bread',
    description:
      'Traditional slow-fermented sourdough with a crispy crust and open crumb structure.',
    price: '4.50',
    unit: 'piece',
    category: 'Bread',
    status: 'active',
  },
  {
    id: 'p2',
    name: 'Croissant',
    description:
      'Buttery, flaky French croissant made with premium European butter.',
    price: '2.75',
    unit: 'piece',
    category: 'Pastry',
    status: 'active',
  },
  {
    id: 'p3',
    name: 'Volkoren Brood',
    description: 'Whole wheat bread with a dense, hearty texture.',
    price: '3.80',
    unit: 'piece',
    category: 'Bread',
    status: 'active',
  },
  {
    id: 'p4',
    name: 'Appeltaart',
    description: 'Classic Dutch apple pie with cinnamon and raisins.',
    price: '18.50',
    unit: 'piece',
    category: 'Pastry',
    status: 'active',
  },
  {
    id: 'p5',
    name: 'Melk',
    description: 'Fresh whole milk from local dairy farms.',
    price: '1.85',
    unit: 'liter',
    category: 'Dairy',
    status: 'active',
  },
]

export const Loading: Story = {
  args: {
    state: { status: 'loading' },
  },
}

export const FullProfile: Story = {
  args: {
    state: { status: 'loaded', supplier: sampleSupplier },
    products: sampleProducts,
  },
}

export const UnclaimedProfile: Story = {
  args: {
    state: {
      status: 'loaded',
      supplier: { ...sampleSupplier, status: 'unclaimed' },
    },
    products: sampleProducts.slice(0, 2),
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
        deliveryAreas: null,
      },
    },
  },
}

export const WithProducts: Story = {
  args: {
    state: { status: 'loaded', supplier: sampleSupplier },
    products: sampleProducts,
  },
}

export const SingleCategory: Story = {
  args: {
    state: { status: 'loaded', supplier: sampleSupplier },
    products: sampleProducts.filter((p) => p.category === 'Bread'),
  },
}

export const NoProducts: Story = {
  args: {
    state: { status: 'loaded', supplier: sampleSupplier },
    products: [],
  },
}

export const Error: Story = {
  args: {
    state: { status: 'error', message: 'Supplier not found' },
  },
}
