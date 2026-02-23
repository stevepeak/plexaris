import { type Meta, type StoryObj } from '@storybook/react'

import { type CartItemData } from '../cart-item'
import { CheckoutLayout } from './checkout-layout'

const noop = () => undefined

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
  },
]

const SUBTOTAL = SAMPLE_ITEMS.reduce(
  (sum, item) => sum + item.price * item.quantity,
  0,
)

const meta: Meta<typeof CheckoutLayout> = {
  title: 'Order / Checkout / CheckoutLayout',
  component: CheckoutLayout,
}
export default meta
type Story = StoryObj<typeof CheckoutLayout>

export const DraftWithPermission: Story = {
  render: () => (
    <div className="flex h-[600px] w-[1100px]">
      <CheckoutLayout
        orderNumber={1}
        items={SAMPLE_ITEMS}
        subtotal={SUBTOTAL}
        itemCount={SAMPLE_ITEMS.length}
        orderStatus="draft"
        submittedAt={null}
        createdAt={new Date('2025-01-15T10:30:00')}
        notes={null}
        hasPlaceOrderPermission={true}
        onSubmit={noop}
        isSubmitting={false}
        isSuccess={false}
        onBack={noop}
        onDuplicate={noop}
      />
    </div>
  ),
}

export const DraftNoPermission: Story = {
  render: () => (
    <div className="flex h-[600px] w-[1100px]">
      <CheckoutLayout
        orderNumber={1}
        items={SAMPLE_ITEMS}
        subtotal={SUBTOTAL}
        itemCount={SAMPLE_ITEMS.length}
        orderStatus="draft"
        submittedAt={null}
        createdAt={new Date('2025-01-15T10:30:00')}
        notes={null}
        hasPlaceOrderPermission={false}
        onSubmit={noop}
        isSubmitting={false}
        isSuccess={false}
        onBack={noop}
        onDuplicate={noop}
      />
    </div>
  ),
}

export const Submitted: Story = {
  render: () => (
    <div className="flex h-[600px] w-[1100px]">
      <CheckoutLayout
        orderNumber={1}
        items={SAMPLE_ITEMS}
        subtotal={SUBTOTAL}
        itemCount={SAMPLE_ITEMS.length}
        orderStatus="submitted"
        submittedAt={new Date('2025-01-15T14:00:00')}
        createdAt={new Date('2025-01-15T10:30:00')}
        notes="Please deliver to the back entrance. Gate code: 4521."
        hasPlaceOrderPermission={true}
        onSubmit={noop}
        isSubmitting={false}
        isSuccess={false}
        onBack={noop}
        onDuplicate={noop}
      />
    </div>
  ),
}

export const Delivered: Story = {
  render: () => (
    <div className="flex h-[600px] w-[1100px]">
      <CheckoutLayout
        orderNumber={1}
        items={SAMPLE_ITEMS}
        subtotal={SUBTOTAL}
        itemCount={SAMPLE_ITEMS.length}
        orderStatus="delivered"
        submittedAt={new Date('2025-01-15T14:00:00')}
        createdAt={new Date('2025-01-15T10:30:00')}
        notes="Leave at the loading dock."
        hasPlaceOrderPermission={true}
        onSubmit={noop}
        isSubmitting={false}
        isSuccess={false}
        onBack={noop}
        onDuplicate={noop}
      />
    </div>
  ),
}
