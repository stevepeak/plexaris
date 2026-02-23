import { type Meta, type StoryObj } from '@storybook/react'

import { type CartItemData } from '../cart-item'
import { CheckoutInvoice } from './checkout-invoice'

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

const MANY_ITEMS: CartItemData[] = [
  ...SAMPLE_ITEMS,
  {
    id: '6',
    name: 'Avocado Oil',
    price: 8.99,
    unit: 'bottle',
    quantity: 2,
    supplier: 'Green Valley',
    supplierId: 'sup-1',
  },
  {
    id: '7',
    name: 'Coconut Cream',
    price: 3.49,
    unit: 'can',
    quantity: 6,
    supplier: 'NutCo',
    supplierId: 'sup-2',
  },
  {
    id: '8',
    name: 'Ciabatta Rolls',
    price: 4.25,
    unit: 'pack',
    quantity: 8,
    supplier: 'Baker Bros',
    supplierId: 'sup-3',
  },
  {
    id: '9',
    name: 'Greek Yogurt',
    price: 6.99,
    unit: 'tub',
    quantity: 4,
    supplier: 'Green Valley',
    supplierId: 'sup-1',
  },
  {
    id: '10',
    name: 'Tahini Paste',
    price: 7.25,
    unit: 'jar',
    quantity: 3,
    supplier: 'NutCo',
    supplierId: 'sup-2',
  },
  {
    id: '11',
    name: 'Brioche Buns',
    price: 5.5,
    unit: 'pack',
    quantity: 5,
    supplier: 'Baker Bros',
    supplierId: 'sup-3',
  },
]

const SUBTOTAL = SAMPLE_ITEMS.reduce(
  (sum, item) => sum + item.price * item.quantity,
  0,
)
const MANY_SUBTOTAL = MANY_ITEMS.reduce(
  (sum, item) => sum + item.price * item.quantity,
  0,
)

const meta: Meta<typeof CheckoutInvoice> = {
  title: 'Order / Checkout / CheckoutInvoice',
  component: CheckoutInvoice,
}
export default meta
type Story = StoryObj<typeof CheckoutInvoice>

export const Default: Story = {
  render: () => (
    <div className="h-[600px] w-[700px]">
      <CheckoutInvoice
        orderId="a1b2c3d4-e5f6-7890-abcd-ef1234567890"
        items={SAMPLE_ITEMS}
        subtotal={SUBTOTAL}
        isPaid={false}
        createdAt={new Date('2025-01-15T10:30:00')}
      />
    </div>
  ),
}

export const Paid: Story = {
  render: () => (
    <div className="h-[600px] w-[700px]">
      <CheckoutInvoice
        orderId="a1b2c3d4-e5f6-7890-abcd-ef1234567890"
        items={SAMPLE_ITEMS}
        subtotal={SUBTOTAL}
        isPaid={true}
        createdAt={new Date('2025-01-15T10:30:00')}
        submittedAt={new Date('2025-01-15T14:00:00')}
      />
    </div>
  ),
}

export const SingleItem: Story = {
  render: () => (
    <div className="h-[600px] w-[700px]">
      <CheckoutInvoice
        orderId="f9e8d7c6-b5a4-3210-fedc-ba9876543210"
        items={[SAMPLE_ITEMS[0]]}
        subtotal={SAMPLE_ITEMS[0].price * SAMPLE_ITEMS[0].quantity}
        isPaid={false}
        createdAt={new Date('2025-01-20T09:00:00')}
      />
    </div>
  ),
}

export const ManyItems: Story = {
  render: () => (
    <div className="h-[600px] w-[700px]">
      <CheckoutInvoice
        orderId="11223344-5566-7788-99aa-bbccddeeff00"
        items={MANY_ITEMS}
        subtotal={MANY_SUBTOTAL}
        isPaid={false}
        createdAt={new Date('2025-01-18T12:00:00')}
      />
    </div>
  ),
}
