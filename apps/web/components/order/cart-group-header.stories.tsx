import { type Meta, type StoryObj } from '@storybook/react'
import { useState } from 'react'

import { CartGroupHeader } from './cart-group-header'
import { CartItem, type CartItemData } from './cart-item'

const meta: Meta<typeof CartGroupHeader> = {
  title: 'order/CartGroupHeader',
  component: CartGroupHeader,
}
export default meta
type Story = StoryObj<typeof CartGroupHeader>

const supplierItems: CartItemData[] = [
  {
    id: '1',
    name: 'Organic Oat Milk',
    price: 4.99,
    unit: 'case',
    quantity: 5,
    supplier: 'Green Valley',
    supplierId: 's1',
    category: 'Dairy',
  },
  {
    id: '2',
    name: 'Almond Butter',
    price: 12.5,
    unit: 'jar',
    quantity: 3,
    supplier: 'Green Valley',
    supplierId: 's1',
    category: 'Spreads',
  },
]

function InteractiveGroup({
  label,
  items,
  defaultOpen = true,
}: {
  label: string
  items: CartItemData[]
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  const itemCount = items.length
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0)

  return (
    <CartGroupHeader
      label={label}
      itemCount={itemCount}
      subtotal={subtotal}
      open={open}
      onOpenChange={setOpen}
    >
      {items.map((item) => (
        <CartItem key={item.id} item={item} className="pl-8" />
      ))}
    </CartGroupHeader>
  )
}

export const Default: Story = {
  render: () => (
    <div className="w-[288px] border">
      <InteractiveGroup label="Green Valley" items={supplierItems} />
    </div>
  ),
}

export const Collapsed: Story = {
  render: () => (
    <div className="w-[288px] border">
      <InteractiveGroup
        label="Green Valley"
        items={supplierItems}
        defaultOpen={false}
      />
    </div>
  ),
}

export const Ungrouped: Story = {
  render: () => (
    <div className="w-[288px] border">
      <InteractiveGroup label="Ungrouped" items={supplierItems} />
    </div>
  ),
}

export const SingleItem: Story = {
  render: () => (
    <div className="w-[288px] border">
      <InteractiveGroup label="Farm Fresh" items={[supplierItems[0]!]} />
    </div>
  ),
}

export const MultipleGroups: Story = {
  render: () => {
    const secondGroup: CartItemData[] = [
      {
        id: '3',
        name: 'Sourdough Loaf',
        price: 6.0,
        unit: 'ea',
        quantity: 2,
        supplier: 'Baker Bros',
        supplierId: 's2',
        category: 'Bakery',
      },
    ]

    return (
      <div className="w-[288px] border">
        <InteractiveGroup label="Green Valley" items={supplierItems} />
        <InteractiveGroup label="Baker Bros" items={secondGroup} />
      </div>
    )
  },
}
