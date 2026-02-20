'use client'

import { Check, ChevronsUpDown } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  buildCategoryValue,
  getCategoryIcon,
  getCategoryLabel,
  PRODUCT_CATEGORIES,
} from '@/lib/product-categories'
import { cn } from '@/lib/utils'

interface CategoryPickerProps {
  value: string
  onValueChange: (value: string) => void
}

export function CategoryPicker({ value, onValueChange }: CategoryPickerProps) {
  const [open, setOpen] = useState(false)

  const Icon = value ? getCategoryIcon(value) : undefined
  const displayLabel = value ? getCategoryLabel(value) : undefined

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
          id="product-category"
        >
          {value ? (
            <span className="flex items-center gap-2">
              {Icon && (
                <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
              )}
              {displayLabel}
            </span>
          ) : (
            <span className="text-muted-foreground">Select category</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput placeholder="Search categories..." />
          <CommandList>
            <CommandEmpty>No category found.</CommandEmpty>
            {PRODUCT_CATEGORIES.map((cat) => (
              <CommandGroup
                key={cat.label}
                heading={
                  <span className="flex items-center gap-1.5">
                    <cat.icon className="h-3.5 w-3.5" />
                    {cat.label}
                  </span>
                }
              >
                <CommandItem
                  value={cat.label}
                  onSelect={() => {
                    onValueChange(cat.label)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      'h-4 w-4',
                      value === cat.label ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                  {cat.label}
                </CommandItem>
                {cat.subcategories?.map((sub) => {
                  const compound = buildCategoryValue(cat.label, sub)
                  return (
                    <CommandItem
                      key={sub}
                      value={compound}
                      onSelect={() => {
                        onValueChange(compound)
                        setOpen(false)
                      }}
                    >
                      <Check
                        className={cn(
                          'h-4 w-4',
                          value === compound ? 'opacity-100' : 'opacity-0',
                        )}
                      />
                      {sub}
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
