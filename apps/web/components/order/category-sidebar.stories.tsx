import { type Meta, type StoryObj } from '@storybook/react'

import {
  type BrowseProduct,
  type Category,
  CategorySidebar,
} from './category-sidebar'

const meta: Meta<typeof CategorySidebar> = {
  title: 'order/CategorySidebar',
  component: CategorySidebar,
}
export default meta
type Story = StoryObj<typeof CategorySidebar>

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = (_category: Category | null) => {}
// eslint-disable-next-line @typescript-eslint/no-empty-function
const noopSearch = (_value: string) => {}

const sampleProducts: BrowseProduct[] = [
  {
    id: '1',
    name: 'Whole Milk 1L',
    description: 'Fresh whole milk',
    price: '1.50',
    unit: 'liter',
    category: 'Dairy',
    supplier: { id: 's1', name: 'Fresh Foods BV' },
  },
  {
    id: '2',
    name: 'Gouda Cheese',
    description: 'Aged gouda',
    price: '8.99',
    unit: 'kg',
    category: 'Dairy',
    supplier: { id: 's2', name: 'Holland Dairy' },
  },
  {
    id: '3',
    name: 'Greek Yogurt',
    description: null,
    price: '3.25',
    unit: 'piece',
    category: 'Dairy',
    supplier: { id: 's1', name: 'Fresh Foods BV' },
  },
]

export const Default: Story = {
  render: () => (
    <div className="h-[400px] w-[200px] border">
      <CategorySidebar
        activeCategory={null}
        onNavigate={noop}
        search=""
        onSearchChange={noopSearch}
      />
    </div>
  ),
}

export const NavigatedWithProducts: Story = {
  render: () => (
    <div className="h-[400px] w-[200px] border">
      <CategorySidebar
        activeCategory="Dairy"
        onNavigate={noop}
        search=""
        onSearchChange={noopSearch}
        products={sampleProducts}
      />
    </div>
  ),
}

export const NavigatedLoading: Story = {
  render: () => (
    <div className="h-[400px] w-[200px] border">
      <CategorySidebar
        activeCategory="Dairy"
        onNavigate={noop}
        search=""
        onSearchChange={noopSearch}
        isLoading
      />
    </div>
  ),
}

export const NavigatedEmpty: Story = {
  render: () => (
    <div className="h-[400px] w-[200px] border">
      <CategorySidebar
        activeCategory="Dairy"
        onNavigate={noop}
        search=""
        onSearchChange={noopSearch}
        products={[]}
      />
    </div>
  ),
}

export const SearchFromRoot: Story = {
  render: () => (
    <div className="h-[400px] w-[200px] border">
      <CategorySidebar
        activeCategory={null}
        onNavigate={noop}
        search="milk"
        onSearchChange={noopSearch}
        products={[sampleProducts[0]!]}
      />
    </div>
  ),
}
