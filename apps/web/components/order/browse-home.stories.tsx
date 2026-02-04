import { type Meta, type StoryObj } from '@storybook/react'

import { BrowseHome, type BrowseSection } from './browse-home'

const meta: Meta<typeof BrowseHome> = {
  title: 'Order / Browse / BrowseHome',
  component: BrowseHome,
}
export default meta
type Story = StoryObj<typeof BrowseHome>

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = (_section: BrowseSection) => {}

export const Default: Story = {
  render: () => (
    <div className="w-[250px] border">
      <BrowseHome onSelect={noop} />
    </div>
  ),
}

export const Narrow: Story = {
  render: () => (
    <div className="w-[200px] border">
      <BrowseHome onSelect={noop} />
    </div>
  ),
}
