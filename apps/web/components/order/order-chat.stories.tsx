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

export const WithMessages: Story = {
  render: () => (
    <div className="h-[500px] w-[320px] border">
      <OrderChat
        initialMessages={[
          {
            id: '1',
            role: 'user',
            content: 'I need 5 cases of organic oat milk',
            timestamp: new Date('2025-01-15T10:00:00'),
          },
          {
            id: '2',
            role: 'assistant',
            content: "Got it! I'll add that to your order.",
            timestamp: new Date('2025-01-15T10:00:01'),
          },
          {
            id: '3',
            role: 'user',
            content: 'Also 2 cases of almond butter',
            timestamp: new Date('2025-01-15T10:01:00'),
          },
          {
            id: '4',
            role: 'assistant',
            content: 'Sure thing — anything else you need?',
            timestamp: new Date('2025-01-15T10:01:01'),
          },
          {
            id: '5',
            role: 'user',
            content: "That's it for now, thanks!",
            timestamp: new Date('2025-01-15T10:02:00'),
          },
          {
            id: '6',
            role: 'assistant',
            content: 'Added! Want to review your order?',
            timestamp: new Date('2025-01-15T10:02:01'),
          },
        ]}
      />
    </div>
  ),
}
