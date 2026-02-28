import { AlertTriangle, EyeOff, Percent, Tag } from 'lucide-react'

const frustrations = [
  {
    icon: Percent,
    title: 'Margin Squeeze',
    description:
      'Platform fees eating 15-25% of your revenue? You deserve better than being squeezed by intermediaries.',
  },
  {
    icon: Tag,
    title: 'Hidden Fees',
    description:
      'Listing fees, promotion fees, transaction fees — the costs keep stacking up with no transparency.',
  },
  {
    icon: EyeOff,
    title: 'No Customer Visibility',
    description:
      "Platforms own your customer data. You can't see who's buying, their patterns, or build direct relationships.",
  },
  {
    icon: AlertTriangle,
    title: 'Private Label Threat',
    description:
      'Platforms use your sales data to launch competing private-label products that undercut you.',
  },
]

export function PainPoints() {
  return (
    <section className="bg-red-50/60 py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="font-heading text-3xl font-bold text-neutral-900 md:text-5xl">
            Sound Familiar?
          </h2>
          <p className="mt-4 text-neutral-500">
            If you&apos;re a food supplier, you know these problems too well
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {frustrations.map((f) => (
            <div
              key={f.title}
              className="rounded-xl border border-red-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="mb-4 flex size-10 items-center justify-center rounded-lg bg-red-100">
                <f.icon className="size-5 text-red-600" />
              </div>
              <h3 className="font-heading text-base font-semibold text-red-800">
                {f.title}
              </h3>
              <p className="mt-2 text-sm text-neutral-600">{f.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <a
            href="#pricing"
            className="inline-flex items-center gap-1 text-sm font-semibold text-violet-600 transition-colors hover:text-violet-500"
          >
            There is a better way &rarr;
          </a>
        </div>
      </div>
    </section>
  )
}
