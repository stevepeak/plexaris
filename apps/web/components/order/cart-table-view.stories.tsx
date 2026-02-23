import { type Meta, type StoryObj } from '@storybook/react'

import { useCartState } from '@/hooks/use-cart-state'

import { type CartItemData } from './cart-item'
import { CartTableView } from './cart-table-view'

const SAMPLE_ITEMS: CartItemData[] = [
  {
    id: '1',
    name: 'Organic Oat Milk',
    price: 4.99,
    unit: 'case',
    quantity: 5,
    supplier: 'Green Valley',
    supplierId: 'sup-1',
    category: 'Dairy Alternatives',
    assignee: 'Alice',
    addedBy: {
      name: 'Sarah Chen',
      avatarUrl: 'https://i.pravatar.cc/32?u=sarah',
      addedAt: new Date('2025-01-15T10:30:00'),
    },
  },
  {
    id: '2',
    name: 'Almond Butter',
    price: 12.5,
    unit: 'jar',
    quantity: 2,
    supplier: 'NutCo',
    supplierId: 'sup-2',
    category: 'Spreads',
    assignee: 'Bob',
    addedBy: {
      name: 'Alex Rivera',
      avatarUrl: 'https://i.pravatar.cc/32?u=alex',
      addedAt: new Date('2025-01-15T11:15:00'),
    },
  },
  {
    id: '3',
    name: 'Sourdough Bread',
    price: 6.75,
    unit: 'loaf',
    quantity: 10,
    supplier: 'Baker Bros',
    supplierId: 'sup-3',
    category: 'Bakery',
    assignee: 'Alice',
    addedBy: {
      name: 'Sarah Chen',
      avatarUrl: 'https://i.pravatar.cc/32?u=sarah',
      addedAt: new Date('2025-01-15T09:00:00'),
    },
  },
  {
    id: '4',
    name: 'Free Range Eggs',
    price: 5.5,
    unit: 'dozen',
    quantity: 3,
    supplier: 'Green Valley',
    supplierId: 'sup-1',
    category: 'Dairy',
    assignee: 'Bob',
    addedBy: {
      name: 'Jordan Kim',
      avatarUrl: 'https://i.pravatar.cc/32?u=jordan',
      addedAt: new Date('2025-01-14T16:45:00'),
    },
  },
  {
    id: '5',
    name: 'Whole Wheat Flour',
    price: 3.25,
    unit: 'bag',
    quantity: 4,
    supplier: 'Baker Bros',
    supplierId: 'sup-3',
    category: 'Bakery',
    assignee: 'Alice',
    addedBy: {
      name: 'Alex Rivera',
      avatarUrl: 'https://i.pravatar.cc/32?u=alex',
      addedAt: new Date('2025-01-15T08:30:00'),
    },
  },
]

function CartTableViewStory({ items }: { items: CartItemData[] }) {
  const cart = useCartState(items)
  return (
    <div className="h-[400px] w-full border">
      <CartTableView cart={cart} />
    </div>
  )
}

const meta: Meta<typeof CartTableView> = {
  title: 'Order / Cart / CartTableView',
  component: CartTableView,
}
export default meta
type Story = StoryObj<typeof CartTableView>

export const Default: Story = {
  render: () => <CartTableViewStory items={SAMPLE_ITEMS} />,
}

export const Empty: Story = {
  render: () => <CartTableViewStory items={[]} />,
}

export const SingleItem: Story = {
  render: () => (
    <CartTableViewStory
      items={[
        {
          id: '1',
          name: 'Organic Oat Milk',
          price: 4.99,
          unit: 'case',
          quantity: 3,
          supplier: 'Green Valley',
          supplierId: 'sup-1',
          category: 'Dairy Alternatives',
          assignee: 'Alice',
          addedBy: {
            name: 'Sarah Chen',
            avatarUrl: 'https://i.pravatar.cc/32?u=sarah',
            addedAt: new Date('2025-01-15T10:30:00'),
          },
        },
      ]}
    />
  ),
}
