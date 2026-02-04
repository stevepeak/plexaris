import { type Meta, type StoryObj } from '@storybook/react'
import { useState } from 'react'

import { CartLayoutMenu, type CartLayoutMode } from './cart-layout-menu'

const meta: Meta<typeof CartLayoutMenu> = {
  title: 'Order / Cart / CartLayoutMenu',
  component: CartLayoutMenu,
}
export default meta
type Story = StoryObj<typeof CartLayoutMenu>

function InteractiveMenu({
  initialMode = 'flat',
}: {
  initialMode?: CartLayoutMode
}) {
  const [mode, setMode] = useState<CartLayoutMode>(initialMode)
  return (
    <div className="flex items-center gap-4 p-4">
      <CartLayoutMenu value={mode} onValueChange={setMode} />
      <span className="text-sm text-muted-foreground">
        Active: <strong>{mode}</strong>
      </span>
    </div>
  )
}

export const Default: Story = {
  render: () => <InteractiveMenu />,
}

export const FoldersMode: Story = {
  render: () => <InteractiveMenu initialMode="folders" />,
}

export const BySupplier: Story = {
  render: () => <InteractiveMenu initialMode="by-supplier" />,
}

export const ByCategory: Story = {
  render: () => <InteractiveMenu initialMode="by-category" />,
}

export const ByTeamMember: Story = {
  render: () => <InteractiveMenu initialMode="by-team-member" />,
}
