import { type Meta, type StoryObj } from '@storybook/react'

import { TabBar } from './tab-bar'
import { type TabItem } from './types'

const meta: Meta<typeof TabBar> = {
  title: 'Order / Layout / TabBar',
  component: TabBar,
}
export default meta
type Story = StoryObj<typeof TabBar>

const sampleTabs: TabItem[] = [
  { type: 'product', id: '1', label: 'Whole Milk 1L' },
  { type: 'product', id: '2', label: 'Gouda Cheese' },
  { type: 'supplier', id: 's1', label: 'Fresh Foods BV' },
]

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noopSelect = (_key: string) => {}
// eslint-disable-next-line @typescript-eslint/no-empty-function
const noopClose = (_key: string) => {}

export const Default: Story = {
  render: () => (
    <div className="w-[500px] border">
      <TabBar
        tabs={sampleTabs}
        activeTabKey="product:1"
        onSelect={noopSelect}
        onClose={noopClose}
      />
    </div>
  ),
}

export const SingleTab: Story = {
  render: () => (
    <div className="w-[500px] border">
      <TabBar
        tabs={[sampleTabs[0]!]}
        activeTabKey="product:1"
        onSelect={noopSelect}
        onClose={noopClose}
      />
    </div>
  ),
}

export const SupplierActive: Story = {
  render: () => (
    <div className="w-[500px] border">
      <TabBar
        tabs={sampleTabs}
        activeTabKey="supplier:s1"
        onSelect={noopSelect}
        onClose={noopClose}
      />
    </div>
  ),
}
