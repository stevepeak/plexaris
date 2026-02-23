import { type Meta, type StoryObj } from '@storybook/react'

import { useCartState } from '@/hooks/use-cart-state'

import { type CartItemData } from './cart-item'
import { type CartLayoutMode } from './cart-layout-menu'
import { OrderCart } from './order-cart'

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

const ITEMS_WITH_UNGROUPED: CartItemData[] = [
  ...SAMPLE_ITEMS,
  {
    id: '6',
    name: 'Mystery Item',
    price: 9.99,
    unit: 'each',
    quantity: 1,
    supplier: 'Unknown Supplier',
    supplierId: 'sup-unknown',
  },
]

function OrderCartStory({
  items,
  layoutMode,
  showActions,
}: {
  items: CartItemData[]
  layoutMode?: CartLayoutMode
  showActions?: boolean
}) {
  const cart = useCartState(items, layoutMode)
  return (
    <div className="h-[500px] w-[250px] border">
      <OrderCart
        cart={cart}
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        onCheckout={() => {}}
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        onOpenCartTab={showActions ? () => {} : undefined}
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        onOpenActivityTab={showActions ? () => {} : undefined}
      />
    </div>
  )
}

const meta: Meta<typeof OrderCart> = {
  title: 'Order / Cart / OrderCart',
  component: OrderCart,
}
export default meta
type Story = StoryObj<typeof OrderCart>

export const Empty: Story = {
  render: () => <OrderCartStory items={[]} />,
}

export const Flat: Story = {
  render: () => <OrderCartStory items={SAMPLE_ITEMS} layoutMode="flat" />,
}

export const WithActions: Story = {
  render: () => (
    <OrderCartStory items={SAMPLE_ITEMS} layoutMode="flat" showActions />
  ),
}

export const MixedItems: Story = {
  render: () => (
    <div className="h-[600px] w-[250px] border">
      <OrderCartStory items={ITEMS_WITH_UNGROUPED} layoutMode="flat" />
    </div>
  ),
}

export const GroupedBySupplier: Story = {
  render: () => (
    <OrderCartStory items={SAMPLE_ITEMS} layoutMode="by-supplier" />
  ),
}

export const GroupedByCategory: Story = {
  render: () => (
    <OrderCartStory items={SAMPLE_ITEMS} layoutMode="by-category" />
  ),
}

export const GroupedByTeamMember: Story = {
  render: () => (
    <OrderCartStory items={SAMPLE_ITEMS} layoutMode="by-team-member" />
  ),
}

export const SingleItem: Story = {
  render: () => (
    <OrderCartStory
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
            addedAt: new Date('2025-01-15T10:30:00'),
          },
        },
      ]}
    />
  ),
}
