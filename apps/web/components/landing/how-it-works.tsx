const steps = [
  {
    number: '01',
    title: 'Connect Your Accounts',
    description:
      'Sign up in under 2 minutes. Link your supplier accounts or browse the Plexaris marketplace to find new partners.',
  },
  {
    number: '02',
    title: 'Place Orders Naturally',
    description:
      'Use voice, text, or your prep list. Plexaris translates your needs into precise orders with the right quantities and specs.',
  },
  {
    number: '03',
    title: 'Track & Optimize',
    description:
      "Monitor deliveries in real time, compare pricing across suppliers, and let AI surface savings you didn't know existed.",
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="font-heading text-3xl font-bold md:text-5xl">
            Get Started in 3 Simple Steps
          </h2>
          <p className="mt-4 text-neutral-500">
            From sign-up to first order in minutes, not days
          </p>
        </div>

        <div className="relative mt-16 grid gap-8 md:grid-cols-3 md:gap-12">
          {/* Connecting line (desktop only) */}
          <div className="pointer-events-none absolute left-0 right-0 top-8 hidden border-t-2 border-dashed border-neutral-200 md:block" />

          {steps.map((step) => (
            <div key={step.number} className="relative text-center">
              <div className="relative mx-auto mb-6 flex size-16 items-center justify-center rounded-full border-2 border-violet-300 bg-white font-heading text-xl font-bold text-violet-600">
                {step.number}
              </div>
              <h3 className="font-heading text-lg font-semibold">
                {step.title}
              </h3>
              <p className="mt-2 text-sm text-neutral-500">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
