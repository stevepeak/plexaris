import { BarChart3, Eye, Megaphone, Shield } from 'lucide-react'

const benefits = [
  {
    icon: BarChart3,
    title: 'Higher Margins',
    description:
      'Only 3% platform fee — no hidden costs, no listing fees. Keep more of every sale compared to traditional platforms.',
  },
  {
    icon: Eye,
    title: 'Customer Intelligence',
    description:
      'Full visibility into ordering patterns, customer preferences, and demand trends. Own your data, not the platform.',
  },
  {
    icon: Megaphone,
    title: 'Marketing Control',
    description:
      'Promote your products directly to HoReCa buyers. Run deals, feature new items, and build your brand on your terms.',
  },
  {
    icon: Shield,
    title: 'Independence',
    description:
      'No exclusivity requirements. Sell on Plexaris alongside your existing channels — we complement, not replace.',
  },
]

export function ForSuppliers() {
  return (
    <section className="py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="font-heading text-3xl font-bold md:text-5xl">
            For Suppliers
          </h2>
          <p className="mt-4 text-neutral-500">
            Reach more restaurants. Keep more margin. Own your customer
            relationships.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {benefits.map((b) => (
            <div
              key={b.title}
              className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm"
            >
              <div className="mb-4 flex size-10 items-center justify-center rounded-lg bg-cyan-50">
                <b.icon className="size-5 text-cyan-600" />
              </div>
              <h3 className="font-heading text-base font-semibold">
                {b.title}
              </h3>
              <p className="mt-2 text-sm text-neutral-500">{b.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
