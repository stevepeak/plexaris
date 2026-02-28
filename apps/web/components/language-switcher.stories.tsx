import { type Meta, type StoryObj } from '@storybook/react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { LanguageSubmenu } from './language-switcher'

const meta: Meta<typeof LanguageSubmenu> = {
  title: 'Components / LanguageSubmenu',
  component: LanguageSubmenu,
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
type Story = StoryObj<typeof LanguageSubmenu>

export const Default: Story = {}
