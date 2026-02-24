import {
  Calculator,
  ChefHat,
  Package,
  Search,
  Sparkles,
  Tag,
  UtensilsCrossed,
  Wallet,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'

const benefits = [
  {
    icon: Wallet,
    title: 'Better Pricing',
    description:
      'Compare prices across suppliers instantly. AI finds you the best deals on the products you already buy.',
  },
  {
    icon: Sparkles,
    title: 'AI-Powered Ordering',
    description:
      'Voice or text — order however feels natural. Plexaris handles the rest, from product matching to supplier routing.',
  },
  {
    icon: Search,
    title: 'Product Discovery',
    description:
      'Find new suppliers and specialty products. Discover alternatives that match your quality standards at lower prices.',
  },
]

const operations = [
  {
    icon: UtensilsCrossed,
    title: 'POS Integration',
    description:
      'Connect your point-of-sale to auto-reorder based on sales velocity.',
  },
  {
    icon: Package,
    title: 'Stock Inventory',
    description:
      'Real-time inventory tracking synced with your ordering patterns.',
  },
  {
    icon: Calculator,
    title: 'Cost & Price Calculations',
    description: 'Know your exact plate costs and optimize menu pricing.',
  },
  {
    icon: ChefHat,
    title: 'Menu Engineering',
    description:
      'Data-driven insights on which dishes to promote, modify, or remove.',
  },
]

export function ForHoreca() {
  return (
    <section className="py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="font-heading text-3xl font-bold md:text-5xl">
            For HoReCa
          </h2>
          <Badge className="mt-4 border-emerald-200 bg-emerald-50 text-emerald-700">
            <Tag className="mr-1 size-3" />
            100% Free
          </Badge>
          <p className="mt-4 text-neutral-500">
            Everything you need to order smarter — at zero cost
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {benefits.map((b) => (
            <div
              key={b.title}
              className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm"
            >
              <div className="mb-4 flex size-10 items-center justify-center rounded-lg bg-emerald-50">
                <b.icon className="size-5 text-emerald-600" />
              </div>
              <h3 className="font-heading text-base font-semibold">
                {b.title}
              </h3>
              <p className="mt-2 text-sm text-neutral-500">{b.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <h3 className="font-heading text-xl font-semibold md:text-2xl">
            Connected to Your Restaurant Operations
          </h3>
          <p className="mt-2 text-neutral-500">
            Plexaris integrates with your existing tools
          </p>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {operations.map((op) => (
            <div
              key={op.title}
              className="rounded-xl border border-neutral-200 bg-neutral-50 p-5"
            >
              <div className="mb-3 flex size-9 items-center justify-center rounded-lg bg-neutral-200">
                <op.icon className="size-4 text-neutral-600" />
              </div>
              <h4 className="text-sm font-semibold">{op.title}</h4>
              <p className="mt-1 text-xs text-neutral-500">{op.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
