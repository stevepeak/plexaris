'use i18n'
import { Group, List, type LucideIcon, Store, Tag, Users } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

export type CartLayoutMode =
  | 'flat'
  | 'by-supplier'
  | 'by-category'
  | 'by-team-member'

interface LayoutOption {
  value: CartLayoutMode
  label: string
  icon: LucideIcon
}

const organizeOptions: LayoutOption[] = [
  { value: 'flat', label: 'Flat', icon: List },
]

const groupByOptions: LayoutOption[] = [
  { value: 'by-supplier', label: 'Supplier', icon: Store },
  { value: 'by-category', label: 'Category', icon: Tag },
  { value: 'by-team-member', label: 'Team Member', icon: Users },
]

function OptionLabel({ text }: { text: string }) {
  switch (text) {
    case 'Flat':
      return <span>Flat</span>
    case 'Supplier':
      return <span>Supplier</span>
    case 'Category':
      return <span>Category</span>
    case 'Team Member':
      return <span>Team Member</span>
    default:
      return <span>{text}</span>
  }
}

interface CartLayoutMenuProps {
  value: CartLayoutMode
  onValueChange: (mode: CartLayoutMode) => void
}

export function CartLayoutMenu({ value, onValueChange }: CartLayoutMenuProps) {
  return (
    <Tooltip>
      <DropdownMenu>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <Group className="h-4 w-4" />
              <span className="sr-only">Change display</span>
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>Change display</TooltipContent>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuRadioGroup
            value={value}
            onValueChange={(v) => onValueChange(v as CartLayoutMode)}
          >
            {organizeOptions.map((option) => (
              <DropdownMenuRadioItem key={option.value} value={option.value}>
                <option.icon className="mr-2 h-4 w-4" />
                <OptionLabel text={option.label} />
              </DropdownMenuRadioItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Group by</DropdownMenuLabel>
            {groupByOptions.map((option) => (
              <DropdownMenuRadioItem key={option.value} value={option.value}>
                <option.icon className="mr-2 h-4 w-4" />
                <OptionLabel text={option.label} />
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </Tooltip>
  )
}
