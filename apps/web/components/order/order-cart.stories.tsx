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
      <OrderCart />
    </div>
  ),
}
