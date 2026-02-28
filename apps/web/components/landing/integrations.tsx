import { Database, Truck, Warehouse } from 'lucide-react'

const integrations = [
  {
    icon: Database,
    title: 'ERP Integration',
    description:
      'Connect your existing ERP system. Orders flow directly into your back office — no manual re-entry, no copy-paste errors.',
  },
  {
    icon: Warehouse,
    title: 'Warehouse Management',
    description:
      'Real-time stock sync keeps your availability accurate. Customers see what you actually have, reducing order rejections.',
  },
  {
    icon: Truck,
    title: 'Logistics & Delivery',
    description:
      'Integrate your delivery fleet or use our logistics partners. Route optimization and live tracking included.',
  },
]

export function Integrations() {
  return (
    <section className="py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="font-heading text-3xl font-bold md:text-5xl">
            Seamless Integration
            <br className="hidden md:block" />
            with Your Systems
          </h2>
          <p className="mt-4 text-neutral-500">
            Plexaris fits into your existing workflow, not the other way around
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {integrations.map((item) => (
            <div
              key={item.title}
              className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm"
            >
              <div className="mb-4 flex size-10 items-center justify-center rounded-lg bg-violet-50">
                <item.icon className="size-5 text-violet-600" />
              </div>
              <h3 className="font-heading text-base font-semibold">
                {item.title}
              </h3>
              <p className="mt-2 text-sm text-neutral-500">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
