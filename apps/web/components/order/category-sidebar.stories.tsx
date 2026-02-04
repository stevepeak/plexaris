import { type Meta, type StoryObj } from '@storybook/react'

import { type BrowseSection } from './browse-home'
import { type BrowseProduct, CategorySidebar } from './category-sidebar'

const meta: Meta<typeof CategorySidebar> = {
  title: 'Order / Browse / CategorySidebar',
  component: CategorySidebar,
}
export default meta
type Story = StoryObj<typeof CategorySidebar>

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noopSection = (_section: BrowseSection | null) => {}
// eslint-disable-next-line @typescript-eslint/no-empty-function
const noopCategory = (_category: string | null) => {}
// eslint-disable-next-line @typescript-eslint/no-empty-function
const noopSearch = (_value: string) => {}
// eslint-disable-next-line @typescript-eslint/no-empty-function
const noopProductClick = (_product: BrowseProduct) => {}

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

export const BrowseHomeView: Story = {
  render: () => (
    <div className="h-[400px] w-[250px] border">
      <CategorySidebar
        activeSection={null}
        onSectionChange={noopSection}
        activeCategory={null}
        onNavigate={noopCategory}
        search=""
        onSearchChange={noopSearch}
      />
    </div>
  ),
}

export const SectionSelected: Story = {
  render: () => (
    <div className="h-[400px] w-[250px] border">
      <CategorySidebar
        activeSection="products"
        onSectionChange={noopSection}
        activeCategory={null}
        onNavigate={noopCategory}
        search=""
        onSearchChange={noopSearch}
      />
    </div>
  ),
}

export const SectionSuppliers: Story = {
  render: () => (
    <div className="h-[400px] w-[250px] border">
      <CategorySidebar
        activeSection="suppliers"
        onSectionChange={noopSection}
        activeCategory={null}
        onNavigate={noopCategory}
        search=""
        onSearchChange={noopSearch}
      />
    </div>
  ),
}

export const NavigatedWithProducts: Story = {
  render: () => (
    <div className="h-[400px] w-[250px] border">
      <CategorySidebar
        activeSection="products"
        onSectionChange={noopSection}
        activeCategory="Dairy"
        onNavigate={noopCategory}
        search=""
        onSearchChange={noopSearch}
        products={sampleProducts}
        onProductClick={noopProductClick}
      />
    </div>
  ),
}

export const NavigatedLoading: Story = {
  render: () => (
    <div className="h-[400px] w-[250px] border">
      <CategorySidebar
        activeSection="products"
        onSectionChange={noopSection}
        activeCategory="Dairy"
        onNavigate={noopCategory}
        search=""
        onSearchChange={noopSearch}
        isLoading
      />
    </div>
  ),
}

export const NavigatedEmpty: Story = {
  render: () => (
    <div className="h-[400px] w-[250px] border">
      <CategorySidebar
        activeSection="products"
        onSectionChange={noopSection}
        activeCategory="Dairy"
        onNavigate={noopCategory}
        search=""
        onSearchChange={noopSearch}
        products={[]}
      />
    </div>
  ),
}

export const SearchFromRoot: Story = {
  render: () => (
    <div className="h-[400px] w-[250px] border">
      <CategorySidebar
        activeSection={null}
        onSectionChange={noopSection}
        activeCategory={null}
        onNavigate={noopCategory}
        search="milk"
        onSearchChange={noopSearch}
        products={[sampleProducts[0]!]}
        onProductClick={noopProductClick}
      />
    </div>
  ),
}

const favoritedProducts: BrowseProduct[] = [
  {
    id: '1',
    name: 'Whole Milk 1L',
    description: 'Fresh whole milk',
    price: '1.50',
    unit: 'liter',
    category: 'Dairy',
    supplier: { id: 's1', name: 'Fresh Foods BV' },
    isFavorited: true,
  },
  {
    id: '2',
    name: 'Gouda Cheese',
    description: 'Aged gouda',
    price: '8.99',
    unit: 'kg',
    category: 'Dairy',
    supplier: { id: 's2', name: 'Holland Dairy' },
    isFavorited: false,
  },
  {
    id: '3',
    name: 'Greek Yogurt',
    description: null,
    price: '3.25',
    unit: 'piece',
    category: 'Dairy',
    supplier: { id: 's1', name: 'Fresh Foods BV' },
    isFavorited: true,
  },
]

export const WithFavoritedProducts: Story = {
  render: () => (
    <div className="h-[400px] w-[250px] border">
      <CategorySidebar
        activeSection="products"
        onSectionChange={noopSection}
        activeCategory="Dairy"
        onNavigate={noopCategory}
        search=""
        onSearchChange={noopSearch}
        products={favoritedProducts}
        onProductClick={noopProductClick}
      />
    </div>
  ),
}
