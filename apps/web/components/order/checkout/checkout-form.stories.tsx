import { type Meta, type StoryObj } from '@storybook/react'

import { CheckoutForm } from './checkout-form'

const noop = () => undefined

const meta: Meta<typeof CheckoutForm> = {
  title: 'Order / Checkout / CheckoutForm',
  component: CheckoutForm,
}
export default meta
type Story = StoryObj<typeof CheckoutForm>

export const Default: Story = {
  render: () => (
    <div className="h-[600px] w-[400px] border-l">
      <CheckoutForm
        hasPlaceOrderPermission={true}
        isSubmitting={false}
        onSubmit={noop}
        onBack={noop}
        subtotal={142.45}
        itemCount={5}
      />
    </div>
  ),
}

export const NoPermission: Story = {
  render: () => (
    <div className="h-[600px] w-[400px] border-l">
      <CheckoutForm
        hasPlaceOrderPermission={false}
        isSubmitting={false}
        onSubmit={noop}
        onBack={noop}
        subtotal={142.45}
        itemCount={5}
      />
    </div>
  ),
}

export const Submitting: Story = {
  render: () => (
    <div className="h-[600px] w-[400px] border-l">
      <CheckoutForm
        hasPlaceOrderPermission={true}
        isSubmitting={true}
        onSubmit={noop}
        onBack={noop}
        subtotal={142.45}
        itemCount={5}
      />
    </div>
  ),
}
