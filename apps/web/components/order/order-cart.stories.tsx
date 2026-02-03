import { type Meta, type StoryObj } from '@storybook/react'

import { OrderCart } from './order-cart'

const meta: Meta<typeof OrderCart> = {
  title: 'order/OrderCart',
  component: OrderCart,
}
export default meta
type Story = StoryObj<typeof OrderCart>

export const Empty: Story = {
  render: () => (
    <div className="h-[500px] w-[250px] border">
      <OrderCart initialItems={[]} />
    </div>
  ),
}

export const WithItems: Story = {
  render: () => (
    <div className="h-[500px] w-[250px] border">
      <OrderCart
        initialItems={[
          {
            id: '1',
            name: 'Organic Oat Milk',
            price: 4.99,
            unit: 'case',
            quantity: 5,
            supplier: 'Green Valley',
          },
          {
            id: '2',
            name: 'Almond Butter',
            price: 12.5,
            unit: 'jar',
            quantity: 2,
            supplier: 'NutCo',
          },
          {
            id: '3',
            name: 'Sourdough Bread',
            price: 6.75,
            unit: 'loaf',
            quantity: 10,
            supplier: 'Baker Bros',
          },
        ]}
      />
    </div>
  ),
}

export const SingleItem: Story = {
  render: () => (
    <div className="h-[500px] w-[250px] border">
      <OrderCart
        initialItems={[
          {
            id: '1',
            name: 'Organic Oat Milk',
            price: 4.99,
            unit: 'case',
            quantity: 3,
            supplier: 'Green Valley',
          },
        ]}
      />
    </div>
  ),
}
