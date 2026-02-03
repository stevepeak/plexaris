import { type Meta, type StoryObj } from '@storybook/react'

import { DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'

import { TooltipProvider } from '@/components/ui/tooltip'

import type { CartItemData } from './cart-item'
import { SortableCartItem } from './sortable-cart-item'

const meta: Meta<typeof SortableCartItem> = {
  title: 'order/SortableCartItem',
  component: SortableCartItem,
  decorators: [
    (Story) => (
      <TooltipProvider delayDuration={300}>
        <Story />
      </TooltipProvider>
    ),
  ],
}
export default meta
type Story = StoryObj<typeof SortableCartItem>

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

export const Default: Story = {
  render: () => (
    <SortableWrapper ids={['1']}>
      <div className="w-[288px] border">
        <SortableCartItem
          item={sampleItem}
          onUpdateQuantity={noop}
          onRemove={noop}
          onOpenProduct={noop}
          onOpenSupplier={noop}
        />
      </div>
    </SortableWrapper>
  ),
}

export const InFolder: Story = {
  render: () => (
    <SortableWrapper ids={['1']}>
      <div className="w-[288px] border">
        <SortableCartItem
          item={sampleItem}
          containerId="folder-1"
          className="pl-4"
          onUpdateQuantity={noop}
          onRemove={noop}
          onOpenProduct={noop}
          onOpenSupplier={noop}
        />
      </div>
    </SortableWrapper>
  ),
}

const items: CartItemData[] = [
  sampleItem,
  {
    id: '2',
    name: 'Sourdough Bread',
    price: 6.5,
    unit: 'loaf',
    quantity: 3,
    supplier: 'Baker Bros',
    supplierId: 's2',
    category: 'Bakery',
  },
  {
    id: '3',
    name: 'Fresh Mozzarella',
    price: 8.99,
    unit: 'lb',
    quantity: 2,
    supplier: 'Green Valley',
    supplierId: 's1',
    category: 'Dairy',
  },
]

export const MultipleItems: Story = {
  render: () => (
    <SortableWrapper ids={items.map((i) => i.id)}>
      <div className="w-[288px] divide-y border">
        {items.map((item) => (
          <SortableCartItem
            key={item.id}
            item={item}
            onUpdateQuantity={noop}
            onRemove={noop}
            onOpenProduct={noop}
            onOpenSupplier={noop}
          />
        ))}
      </div>
    </SortableWrapper>
  ),
}

export const Selected: Story = {
  render: () => (
    <SortableWrapper ids={['1']}>
      <div className="w-[288px] border">
        <SortableCartItem
          item={sampleItem}
          selected
          onUpdateQuantity={noop}
          onRemove={noop}
          onOpenProduct={noop}
          onOpenSupplier={noop}
        />
      </div>
    </SortableWrapper>
  ),
}

export const NoCallbacks: Story = {
  render: () => (
    <SortableWrapper ids={['1']}>
      <div className="w-[288px] border">
        <SortableCartItem item={sampleItem} />
      </div>
    </SortableWrapper>
  ),
}
