import { type Meta, type StoryObj } from '@storybook/react'

import { OrderChat } from './order-chat'

const meta: Meta<typeof OrderChat> = {
  title: 'Order / Chat / OrderChat',
  component: OrderChat,
}
export default meta
type Story = StoryObj<typeof OrderChat>

export const Default: Story = {
  render: () => (
    <div className="h-[500px] w-[320px] border">
      <OrderChat />
    </div>
  ),
}
