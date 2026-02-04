import { type Meta, type StoryObj } from '@storybook/react'

import { ProductDetail } from './product-detail'

const meta: Meta<typeof ProductDetail> = {
  title: 'Order / Browse / ProductDetail',
  component: ProductDetail,
}
export default meta
type Story = StoryObj<typeof ProductDetail>

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noopOpenSupplier = (_id: string, _name: string) => {}

export const Default: Story = {
  render: () => (
    <div className="h-[500px] w-[400px] border">
      <ProductDetail productId="1" onOpenSupplier={noopOpenSupplier} />
    </div>
  ),
}

export const WithOrganization: Story = {
  render: () => (
    <div className="h-[500px] w-[400px] border">
      <ProductDetail
        productId="1"
        onOpenSupplier={noopOpenSupplier}
        organizationId="org-1"
      />
    </div>
  ),
}
