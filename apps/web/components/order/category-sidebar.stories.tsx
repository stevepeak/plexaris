import { type Meta, type StoryObj } from '@storybook/react'

import { type Category, CategorySidebar } from './category-sidebar'

const meta: Meta<typeof CategorySidebar> = {
  title: 'order/CategorySidebar',
  component: CategorySidebar,
}
export default meta
type Story = StoryObj<typeof CategorySidebar>

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = (_category: Category) => {}

export const Default: Story = {
  render: () => (
    <div className="h-[400px] w-[200px] border">
      <CategorySidebar selectedCategory={null} onSelectCategory={noop} />
    </div>
  ),
}

export const WithSelection: Story = {
  render: () => (
    <div className="h-[400px] w-[200px] border">
      <CategorySidebar selectedCategory="Dairy" onSelectCategory={noop} />
    </div>
  ),
}
