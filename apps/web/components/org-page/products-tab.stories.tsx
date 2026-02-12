import { type Meta, type StoryObj } from '@storybook/react'

import { ProductsTab } from './products-tab'

const meta: Meta<typeof ProductsTab> = {
  title: 'Organization / Tabs / ProductsTab',
  component: ProductsTab,
  parameters: {
    nextjs: { appDirectory: true },
  },
}
export default meta
type Story = StoryObj<typeof ProductsTab>

export const Owner: Story = {
  args: {
    organizationId: 'org-1',
    isOwner: true,
  },
}

export const Member: Story = {
  args: {
    organizationId: 'org-1',
    isOwner: false,
  },
}

export const WithInitialProductId: Story = {
  args: {
    organizationId: 'org-1',
    isOwner: true,
    initialProductId: 'prod-draft-456',
  },
}
