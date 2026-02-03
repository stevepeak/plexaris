import { useState } from 'react'

import { type Meta, type StoryObj } from '@storybook/react'

import { DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'

import { TooltipProvider } from '@/components/ui/tooltip'

import type { CartItemData } from './cart-item'
import { SortableCartFolder } from './sortable-cart-folder'
import { SortableCartItem } from './sortable-cart-item'

const meta: Meta<typeof SortableCartFolder> = {
  title: 'order/SortableCartFolder',
  component: SortableCartFolder,
  decorators: [
    (Story) => (
      <TooltipProvider delayDuration={300}>
        <Story />
      </TooltipProvider>
    ),
  ],
}
export default meta
type Story = StoryObj<typeof SortableCartFolder>

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

const noop = () => {}

function SortableWrapper({
  children,
  ids,
}: {
  children: React.ReactNode
  ids: string[]
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  )
  return (
    <DndContext sensors={sensors}>
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        {children}
      </SortableContext>
    </DndContext>
  )
}

function InteractiveFolder({
  items = folderItems,
  defaultOpen = true,
  name = 'Dairy Order',
  folderId = 'folder-1',
}: {
  items?: CartItemData[]
  defaultOpen?: boolean
  name?: string
  folderId?: string
}) {
  const [open, setOpen] = useState(defaultOpen)
  const [folderName, setFolderName] = useState(name)
  const itemIds = items.map((i) => i.id)
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0)

  return (
    <SortableCartFolder
      id={folderId}
      name={folderName}
      itemCount={items.length}
      subtotal={subtotal}
      open={open}
      onOpenChange={setOpen}
      onRename={(_, newName) => setFolderName(newName)}
      onDelete={noop}
      itemIds={itemIds}
    >
      {items.map((item) => (
        <SortableCartItem
          key={item.id}
          item={item}
          containerId={folderId}
          className="pl-4"
          onUpdateQuantity={noop}
          onRemove={noop}
          onOpenProduct={noop}
          onOpenSupplier={noop}
        />
      ))}
    </SortableCartFolder>
  )
}

export const Default: Story = {
  render: () => (
    <SortableWrapper ids={['folder-1', '1', '2']}>
      <div className="w-[288px] border">
        <InteractiveFolder />
      </div>
    </SortableWrapper>
  ),
}

export const Collapsed: Story = {
  render: () => (
    <SortableWrapper ids={['folder-1', '1', '2']}>
      <div className="w-[288px] border">
        <InteractiveFolder defaultOpen={false} />
      </div>
    </SortableWrapper>
  ),
}

export const EmptyFolder: Story = {
  render: () => (
    <SortableWrapper ids={['folder-1']}>
      <div className="w-[288px] border">
        <InteractiveFolder items={[]} />
      </div>
    </SortableWrapper>
  ),
}

export const LongName: Story = {
  render: () => (
    <SortableWrapper ids={['folder-1', '1', '2']}>
      <div className="w-[288px] border">
        <InteractiveFolder name="Weekly Order - Dairy and Fresh Produce Items" />
      </div>
    </SortableWrapper>
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
      <SortableWrapper ids={['folder-1', '1', '2', 'folder-2', '3']}>
        <div className="w-[288px] divide-y border">
          <InteractiveFolder />
          <InteractiveFolder
            folderId="folder-2"
            name="Bakery Order"
            items={secondItems}
          />
        </div>
      </SortableWrapper>
    )
  },
}
