import { type Meta, type StoryObj } from '@storybook/react'

import { SupplierDetail } from './supplier-detail'

const meta: Meta<typeof SupplierDetail> = {
  title: 'order/SupplierDetail',
  component: SupplierDetail,
}
export default meta
type Story = StoryObj<typeof SupplierDetail>

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noopOpenProduct = (_id: string, _name: string) => {}

export const Default: Story = {
  render: () => (
    <div className="h-[600px] w-[400px] border">
      <SupplierDetail supplierId="s1" onOpenProduct={noopOpenProduct} />
    </div>
  ),
}

export const WithOrganization: Story = {
  render: () => (
    <div className="h-[600px] w-[400px] border">
      <SupplierDetail
        supplierId="s1"
        onOpenProduct={noopOpenProduct}
        organizationId="org-1"
      />
    </div>
  ),
}
