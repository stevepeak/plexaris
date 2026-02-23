import { type Meta, type StoryObj } from '@storybook/react'

import { OrderTracking } from './order-tracking'

const noop = () => undefined

const meta: Meta<typeof OrderTracking> = {
  title: 'Order / Checkout / OrderTracking',
  component: OrderTracking,
}
export default meta
type Story = StoryObj<typeof OrderTracking>

export const Submitted: Story = {
  render: () => (
    <div className="h-[600px] w-[400px] border-l">
      <OrderTracking
        orderNumber={1}
        status="submitted"
        submittedAt={new Date('2025-01-15T14:00:00')}
        deliveryNotes="Please deliver to the back entrance. Gate code: 4521."
        onDuplicate={noop}
      />
    </div>
  ),
}

export const Confirmed: Story = {
  render: () => (
    <div className="h-[600px] w-[400px] border-l">
      <OrderTracking
        orderNumber={1}
        status="confirmed"
        submittedAt={new Date('2025-01-15T14:00:00')}
        onDuplicate={noop}
      />
    </div>
  ),
}

export const Delivered: Story = {
  render: () => (
    <div className="h-[600px] w-[400px] border-l">
      <OrderTracking
        orderNumber={1}
        status="delivered"
        submittedAt={new Date('2025-01-15T14:00:00')}
        deliveryNotes="Leave at the loading dock."
        onDuplicate={noop}
      />
    </div>
  ),
}

export const Cancelled: Story = {
  render: () => (
    <div className="h-[600px] w-[400px] border-l">
      <OrderTracking
        orderNumber={1}
        status="cancelled"
        submittedAt={new Date('2025-01-15T14:00:00')}
        deliveryNotes="Was supposed to arrive Monday."
        onDuplicate={noop}
      />
    </div>
  ),
}
