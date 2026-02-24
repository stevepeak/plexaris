import { Check } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'

const horecaFeatures = [
  'Unlimited orders',
  'AI voice & text ordering',
  'Smart recommendations',
  'Price comparison across suppliers',
  'Order tracking & history',
  'POS & inventory integration',
]

const supplierFeatures = [
  'Full customer data ownership',
  'Direct marketing to HoReCa',
  'ERP & warehouse integration',
  'Logistics & delivery tools',
  'Analytics dashboard',
  'No listing or hidden fees',
]

export function Pricing() {
  return (
    <section id="pricing" className="py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="font-heading text-3xl font-bold md:text-5xl">
            Simple, Transparent Pricing
          </h2>
          <p className="mt-4 text-neutral-500">
            No surprises. No hidden fees. Just fair pricing for everyone.
          </p>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-2">
          {/* HoReCa Card */}
          <div className="rounded-xl border border-emerald-200 bg-white p-8 shadow-sm">
            <div className="text-sm font-medium uppercase tracking-wider text-emerald-600">
              HoReCa
            </div>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="font-heading text-4xl font-bold">&euro;0</span>
              <span className="text-neutral-500">Forever Free</span>
            </div>
            <p className="mt-2 text-sm text-neutral-500">
              Everything you need to order smarter — always free for buyers.
            </p>

            <ul className="mt-8 space-y-3">
              {horecaFeatures.map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm">
                  <Check className="size-4 shrink-0 text-emerald-600" />
                  <span className="text-neutral-600">{f}</span>
                </li>
              ))}
            </ul>

            <Button
              className="mt-8 w-full bg-emerald-600 text-white hover:bg-emerald-700"
              asChild
            >
              <Link href="/signup">Get Started Free</Link>
            </Button>
          </div>

          {/* Supplier Card */}
          <div className="rounded-xl border border-violet-200 bg-white p-8 shadow-sm">
            <div className="text-sm font-medium uppercase tracking-wider text-violet-600">
              Suppliers
            </div>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="font-heading text-4xl font-bold">3%</span>
              <span className="text-neutral-500">Platform Fee</span>
            </div>
            <p className="mt-2 text-sm text-neutral-500">
              Only pay when you make a sale. No upfront costs, no commitments.
            </p>

            <ul className="mt-8 space-y-3">
              {supplierFeatures.map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm">
                  <Check className="size-4 shrink-0 text-violet-600" />
                  <span className="text-neutral-600">{f}</span>
                </li>
              ))}
            </ul>

            <Button
              className="mt-8 w-full bg-violet-600 text-white hover:bg-violet-700"
              asChild
            >
              <Link href="/signup">Start Selling</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
