import { type Meta, type StoryObj } from '@storybook/react'

import { ContentViewer } from './content-viewer'
import { type TabItem } from './types'

const meta: Meta<typeof ContentViewer> = {
  title: 'Order / Browse / ContentViewer',
  component: ContentViewer,
}
export default meta
type Story = StoryObj<typeof ContentViewer>

const sampleTabs: TabItem[] = [
  { type: 'product', id: '1', label: 'Whole Milk 1L' },
  { type: 'supplier', id: 's1', label: 'Fresh Foods BV' },
]

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noopSelectTab = (_key: string) => {}
// eslint-disable-next-line @typescript-eslint/no-empty-function
const noopCloseTab = (_key: string) => {}
// eslint-disable-next-line @typescript-eslint/no-empty-function
const noopOpenSupplier = (_id: string, _name: string) => {}
// eslint-disable-next-line @typescript-eslint/no-empty-function
const noopOpenProduct = (_id: string, _name: string) => {}

export const Empty: Story = {
  render: () => (
    <div className="h-[500px] w-[500px] border">
      <ContentViewer
        tabs={[]}
        activeTabKey={null}
        onSelectTab={noopSelectTab}
        onCloseTab={noopCloseTab}
        onOpenSupplier={noopOpenSupplier}
        onOpenProduct={noopOpenProduct}
      />
    </div>
  ),
}

export const WithProductTab: Story = {
  render: () => (
    <div className="h-[500px] w-[500px] border">
      <ContentViewer
        tabs={sampleTabs}
        activeTabKey="product:1"
        onSelectTab={noopSelectTab}
        onCloseTab={noopCloseTab}
        onOpenSupplier={noopOpenSupplier}
        onOpenProduct={noopOpenProduct}
      />
    </div>
  ),
}

export const WithOrganization: Story = {
  render: () => (
    <div className="h-[500px] w-[500px] border">
      <ContentViewer
        tabs={sampleTabs}
        activeTabKey="product:1"
        onSelectTab={noopSelectTab}
        onCloseTab={noopCloseTab}
        onOpenSupplier={noopOpenSupplier}
        onOpenProduct={noopOpenProduct}
        organizationId="org-1"
      />
    </div>
  ),
}
