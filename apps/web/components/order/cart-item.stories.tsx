import { type Meta, type StoryObj } from '@storybook/react'

import { TooltipProvider } from '@/components/ui/tooltip'

import { CartItem, type CartItemData } from './cart-item'

const meta: Meta<typeof CartItem> = {
  title: 'Order / Cart / CartItem',
  component: CartItem,
  decorators: [
    (story) => <TooltipProvider delayDuration={300}>{story()}</TooltipProvider>,
  ],
}
export default meta
type Story = StoryObj<typeof CartItem>

const sampleItem: CartItemData = {
  id: '1',
  name: 'Organic Oat Milk',
  price: 4.99,
  unit: 'case',
  quantity: 5,
  supplier: 'Green Valley',
  supplierId: 's1',
  category: 'Dairy',
  addedBy: {
    name: 'Sarah Chen',
    addedAt: new Date('2025-01-15T10:30:00'),
  },
}

const noop = () => undefined

export const Default: Story = {
  render: () => (
    <div className="w-[280px] border">
      <CartItem item={sampleItem} onOpenProduct={noop} onOpenSupplier={noop} />
    </div>
  ),
}

export const Selected: Story = {
  render: () => (
    <div className="w-[280px] border">
      <CartItem
        item={sampleItem}
        selected
        onOpenProduct={noop}
        onOpenSupplier={noop}
      />
    </div>
  ),
}

export const WithAvatar: Story = {
  render: () => (
    <div className="w-[280px] border">
      <CartItem
        item={{
          ...sampleItem,
          addedBy: {
            name: 'Alex Rivera',
            avatarUrl: 'https://i.pravatar.cc/32?u=alex',
            addedAt: new Date('2025-01-15T14:22:00'),
          },
        }}
        onOpenProduct={noop}
        onOpenSupplier={noop}
      />
    </div>
  ),
}

export const LongName: Story = {
  render: () => (
    <div className="w-[280px] border">
      <CartItem
        item={{
          ...sampleItem,
          id: '2',
          name: 'Extra Premium Cold-Pressed Organic Oat Milk with Added Vitamins',
        }}
        onOpenProduct={noop}
        onOpenSupplier={noop}
      />
    </div>
  ),
}

export const HighQuantity: Story = {
  render: () => (
    <div className="w-[280px] border">
      <CartItem
        item={{ ...sampleItem, id: '3', quantity: 999 }}
        onOpenProduct={noop}
        onOpenSupplier={noop}
      />
    </div>
  ),
}

export const SingularUnit: Story = {
  render: () => (
    <div className="w-[280px] border">
      <CartItem
        item={{ ...sampleItem, id: '4', quantity: 1 }}
        onOpenProduct={noop}
        onOpenSupplier={noop}
      />
    </div>
  ),
}

export const NoAddedBy: Story = {
  render: () => (
    <div className="w-[280px] border">
      <CartItem
        item={{ ...sampleItem, addedBy: undefined }}
        onOpenProduct={noop}
        onOpenSupplier={noop}
      />
    </div>
  ),
}

export const NoCallbacks: Story = {
  render: () => (
    <div className="w-[280px] border">
      <CartItem item={sampleItem} />
    </div>
  ),
}
