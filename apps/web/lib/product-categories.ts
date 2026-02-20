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

interface ProductCategory {
  label: string
  icon: LucideIcon
}

export const PRODUCT_CATEGORIES: ProductCategory[] = [
  { label: 'Bread', icon: Wheat },
  { label: 'Pastry', icon: Croissant },
  { label: 'Dairy', icon: Milk },
  { label: 'Meat', icon: Beef },
  { label: 'Fish', icon: Fish },
  { label: 'Produce', icon: Apple },
  { label: 'Beverages', icon: CupSoda },
  { label: 'Ingredients', icon: Egg },
  { label: 'Other', icon: MoreHorizontal },
]

/** Look up the icon for a category label. Returns undefined for unknown categories. */
export function getCategoryIcon(label: string): LucideIcon | undefined {
  return PRODUCT_CATEGORIES.find((c) => c.label === label)?.icon
}
