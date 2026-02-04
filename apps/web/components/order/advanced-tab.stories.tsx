import { type Meta, type StoryObj } from '@storybook/react'

import { AdvancedTab } from './advanced-tab'

const meta: Meta<typeof AdvancedTab> = {
  title: 'Order / Cart / AdvancedTab',
  component: AdvancedTab,
}
export default meta
type Story = StoryObj<typeof AdvancedTab>

export const Default: Story = {
  render: () => (
    <div className="h-[400px] w-[500px] border">
      <AdvancedTab orderId="00000000-0000-0000-0000-000000000000" />
    </div>
  ),
}
