import { type Meta, type StoryObj } from '@storybook/react'

import { TooltipProvider } from '@/components/ui/tooltip'

import { CartItem, type CartItemData } from './cart-item'

const meta: Meta<typeof CartItem> = {
  title: 'order/CartItem',
  component: CartItem,
  decorators: [
    (Story) => (
      <TooltipProvider delayDuration={300}>
        <Story />
      </TooltipProvider>
    ),
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
}

const noop = () => {}

export const Default: Story = {
  render: () => (
    <div className="w-[250px] border">
      <CartItem
        item={sampleItem}
        onUpdateQuantity={noop}
        onRemove={noop}
        onOpenProduct={noop}
        onOpenSupplier={noop}
      />
    </div>
  ),
}

export const Selected: Story = {
  render: () => (
    <div className="w-[250px] border">
      <CartItem
        item={sampleItem}
        selected
        onUpdateQuantity={noop}
        onRemove={noop}
        onOpenProduct={noop}
        onOpenSupplier={noop}
      />
    </div>
  ),
}

export const LongName: Story = {
  render: () => (
    <div className="w-[250px] border">
      <CartItem
        item={{
          ...sampleItem,
          id: '2',
          name: 'Extra Premium Cold-Pressed Organic Oat Milk with Added Vitamins',
        }}
        onUpdateQuantity={noop}
        onRemove={noop}
        onOpenProduct={noop}
        onOpenSupplier={noop}
      />
    </div>
  ),
}

export const HighQuantity: Story = {
  render: () => (
    <div className="w-[250px] border">
      <CartItem
        item={{ ...sampleItem, id: '3', quantity: 999 }}
        onUpdateQuantity={noop}
        onRemove={noop}
        onOpenProduct={noop}
        onOpenSupplier={noop}
      />
    </div>
  ),
}

export const NoCallbacks: Story = {
  render: () => (
    <div className="w-[250px] border">
      <CartItem item={sampleItem} />
    </div>
  ),
}
