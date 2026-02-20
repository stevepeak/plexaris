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
  subcategories?: string[]
}

export const PRODUCT_CATEGORIES: ProductCategory[] = [
  {
    label: 'Bread',
    icon: Wheat,
    subcategories: ['Sourdough', 'White bread', 'Whole wheat', 'Rye', 'Rolls'],
  },
  {
    label: 'Pastry',
    icon: Croissant,
    subcategories: ['Croissants', 'Danish', 'Pies', 'Cakes', 'Cookies'],
  },
  {
    label: 'Dairy',
    icon: Milk,
    subcategories: ['Milk', 'Cheese', 'Yogurt', 'Butter', 'Cream'],
  },
  {
    label: 'Meat',
    icon: Beef,
    subcategories: ['Beef', 'Pork', 'Poultry', 'Lamb', 'Charcuterie'],
  },
  {
    label: 'Fish',
    icon: Fish,
    subcategories: ['Fresh fish', 'Frozen fish', 'Smoked fish', 'Shellfish'],
  },
  {
    label: 'Produce',
    icon: Apple,
    subcategories: ['Vegetables', 'Fruit', 'Herbs', 'Salads'],
  },
  {
    label: 'Beverages',
    icon: CupSoda,
    subcategories: ['Juices', 'Soft drinks', 'Water', 'Coffee', 'Tea'],
  },
  {
    label: 'Ingredients',
    icon: Egg,
    subcategories: ['Eggs', 'Flour', 'Sugar', 'Oils', 'Spices'],
  },
  { label: 'Other', icon: MoreHorizontal },
]

const CATEGORY_SEPARATOR = ' > '

/** Build a compound category value like "Fish > Fresh fish" */
export function buildCategoryValue(primary: string, sub?: string): string {
  if (!sub) return primary
  return `${primary}${CATEGORY_SEPARATOR}${sub}`
}

/** Parse a compound category value into { primary, sub } */
export function parseCategoryValue(value: string): {
  primary: string
  sub: string | null
} {
  const idx = value.indexOf(CATEGORY_SEPARATOR)
  if (idx === -1) return { primary: value, sub: null }
  return {
    primary: value.slice(0, idx),
    sub: value.slice(idx + CATEGORY_SEPARATOR.length),
  }
}

/** Get a display label — returns "Fresh fish" for "Fish > Fresh fish", or "Fish" for "Fish" */
export function getCategoryLabel(value: string): string {
  const { primary, sub } = parseCategoryValue(value)
  return sub ?? primary
}

/** Look up the icon for a category label. Handles compound values by using the primary part. */
export function getCategoryIcon(label: string): LucideIcon | undefined {
  const { primary } = parseCategoryValue(label)
  return PRODUCT_CATEGORIES.find((c) => c.label === primary)?.icon
}
