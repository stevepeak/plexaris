import { type Meta, type StoryObj } from '@storybook/react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { ThemeSubmenu } from './theme-toggle'

const meta: Meta<typeof ThemeSubmenu> = {
  title: 'Components / ThemeSubmenu',
  component: ThemeSubmenu,
  decorators: [
    (story) => (
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger asChild>
          <button className="rounded border px-3 py-1.5 text-sm">
            Open menu
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>{story()}</DropdownMenuContent>
      </DropdownMenu>
    ),
  ],
}
export default meta
type Story = StoryObj<typeof ThemeSubmenu>

export const Default: Story = {}
