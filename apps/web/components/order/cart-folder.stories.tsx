import { type Meta, type StoryObj } from '@storybook/react'
import { useState } from 'react'

import { TooltipProvider } from '@/components/ui/tooltip'

import { CartFolder } from './cart-folder'
import { CartItem, type CartItemData } from './cart-item'

const meta: Meta<typeof CartFolder> = {
  title: 'order/CartFolder',
  component: CartFolder,
  decorators: [
    (story) => <TooltipProvider delayDuration={300}>{story()}</TooltipProvider>,
  ],
}
export default meta
type Story = StoryObj<typeof CartFolder>

const folderItems: CartItemData[] = [
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

const noop = () => undefined

function InteractiveFolder({
  name = 'New Folder',
  items = folderItems,
  defaultOpen = true,
}: {
  name?: string
  items?: CartItemData[]
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  const [folderName, setFolderName] = useState(name)
  const itemCount = items.length
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0)

  return (
    <CartFolder
      id="folder-1"
      name={folderName}
      itemCount={itemCount}
      subtotal={subtotal}
      open={open}
      onOpenChange={setOpen}
      onRename={(_, newName) => setFolderName(newName)}
      onDelete={noop}
    >
      {items.map((item) => (
        <CartItem
          key={item.id}
          item={item}
          className="pl-8"
          onUpdateQuantity={noop}
          onRemove={noop}
          onOpenProduct={noop}
          onOpenSupplier={noop}
        />
      ))}
    </CartFolder>
  )
}

export const Default: Story = {
  render: () => (
    <div className="w-[288px] border">
      <InteractiveFolder />
    </div>
  ),
}

export const Collapsed: Story = {
  render: () => (
    <div className="w-[288px] border">
      <InteractiveFolder defaultOpen={false} />
    </div>
  ),
}

export const EmptyFolder: Story = {
  render: () => (
    <div className="w-[288px] border">
      <InteractiveFolder items={[]} />
    </div>
  ),
}

export const LongName: Story = {
  render: () => (
    <div className="w-[288px] border">
      <InteractiveFolder name="Weekly Order - Dairy and Fresh Produce Items" />
    </div>
  ),
}

export const MultipleFolders: Story = {
  render: () => {
    const secondItems: CartItemData[] = [
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
        <InteractiveFolder name="Dairy Order" />
        <InteractiveFolder name="Bakery Order" items={secondItems} />
      </div>
    )
  },
}
