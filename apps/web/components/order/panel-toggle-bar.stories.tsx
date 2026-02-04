import { type Meta, type StoryObj } from '@storybook/react'
import { useState } from 'react'

import { type PanelState, PanelToggleBar } from './panel-toggle-bar'

const meta: Meta<typeof PanelToggleBar> = {
  title: 'Order / Layout / PanelToggleBar',
  component: PanelToggleBar,
}
export default meta
type Story = StoryObj<typeof PanelToggleBar>

function Interactive({ initial }: { initial: PanelState }) {
  const [panels, setPanels] = useState<PanelState>(initial)
  return (
    <PanelToggleBar
      panels={panels}
      onToggle={(key) => setPanels((prev) => ({ ...prev, [key]: !prev[key] }))}
    />
  )
}

export const Default: Story = {
  render: () => (
    <Interactive initial={{ search: true, order: true, chat: false }} />
  ),
}

export const AllOn: Story = {
  render: () => (
    <Interactive initial={{ search: true, order: true, chat: true }} />
  ),
}

export const AllOff: Story = {
  render: () => (
    <Interactive initial={{ search: false, order: false, chat: false }} />
  ),
}
