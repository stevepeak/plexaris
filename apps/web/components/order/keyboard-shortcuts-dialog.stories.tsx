import { type Meta, type StoryObj } from '@storybook/react'

import { KeyboardShortcutsDialog } from './keyboard-shortcuts-dialog'

const meta: Meta<typeof KeyboardShortcutsDialog> = {
  title: 'Order/KeyboardShortcutsDialog',
  component: KeyboardShortcutsDialog,
  args: {
    open: true,
    onOpenChange: () => undefined,
  },
}

export default meta
type Story = StoryObj<typeof KeyboardShortcutsDialog>

export const Default: Story = {}
