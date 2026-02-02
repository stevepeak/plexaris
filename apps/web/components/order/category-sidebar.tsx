'use client'

import {
  Apple,
  Beef,
  Croissant,
  CupSoda,
  Egg,
  Fish,
  type LucideIcon,
  Milk,
  MoreHorizontal,
  Wheat,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'

const CATEGORIES = [
  { label: 'Bread', icon: Wheat },
  { label: 'Pastry', icon: Croissant },
  { label: 'Dairy', icon: Milk },
  { label: 'Meat', icon: Beef },
  { label: 'Fish', icon: Fish },
  { label: 'Produce', icon: Apple },
  { label: 'Beverages', icon: CupSoda },
  { label: 'Ingredients', icon: Egg },
  { label: 'Other', icon: MoreHorizontal },
] as const satisfies readonly { label: string; icon: LucideIcon }[]

export type Category = (typeof CATEGORIES)[number]['label']

interface CategorySidebarProps {
  selectedCategory: Category | null
  onSelectCategory: (category: Category) => void
}

export function CategorySidebar({
  selectedCategory,
  onSelectCategory,
}: CategorySidebarProps) {
  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col gap-1 p-2">
        {CATEGORIES.map((category) => (
          <Button
            key={category.label}
            variant={
              selectedCategory === category.label ? 'secondary' : 'ghost'
            }
            className="justify-start gap-2"
            onClick={() => onSelectCategory(category.label)}
          >
            <category.icon className="h-4 w-4" />
            {category.label}
          </Button>
        ))}
      </div>
    </ScrollArea>
  )
}
