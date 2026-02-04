import { ChefHat, Package, Star, Store } from 'lucide-react'

import { Card } from '@/components/ui/card'

export type BrowseSection = 'favorites' | 'products' | 'suppliers' | 'recipes'

interface BrowseHomeProps {
  onSelect: (section: BrowseSection) => void
}

const SECTIONS = [
  {
    key: 'favorites' as const,
    label: 'Favorites',
    description: 'Items you and your staff have favorited',
    icon: Star,
    borderColor: 'border-amber-400',
    iconColor: 'text-amber-500',
  },
  {
    key: 'products' as const,
    label: 'Products',
    description: 'Browse all products',
    icon: Package,
    borderColor: 'border-blue-400',
    iconColor: 'text-blue-500',
  },
  {
    key: 'suppliers' as const,
    label: 'Suppliers',
    description: 'Shop by supplier',
    icon: Store,
    borderColor: 'border-green-400',
    iconColor: 'text-green-500',
  },
  {
    key: 'recipes' as const,
    label: 'Recipes',
    description: 'Order by recipe',
    icon: ChefHat,
    borderColor: 'border-purple-400',
    iconColor: 'text-purple-500',
  },
] satisfies {
  key: BrowseSection
  label: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  borderColor: string
  iconColor: string
}[]

export function BrowseHome({ onSelect }: BrowseHomeProps) {
  return (
    <div className="flex flex-col gap-3 p-4">
      {SECTIONS.map((section) => (
        <Card
          key={section.key}
          className={`cursor-pointer p-3 transition-colors hover:bg-accent ${section.borderColor}`}
          onClick={() => onSelect(section.key)}
        >
          <section.icon className={`h-5 w-5 ${section.iconColor}`} />
          <div className="mt-1.5 text-sm font-medium">{section.label}</div>
          <div className="text-xs text-muted-foreground">
            {section.description}
          </div>
        </Card>
      ))}
    </div>
  )
}
