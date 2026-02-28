import Link from 'next/link'

import { Button } from '@/components/ui/button'

export function CTA() {
  return (
    <section id="get-started" className="py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-gradient-to-br from-violet-50 via-white to-cyan-50 p-10 text-center shadow-sm md:p-16">
          <h2 className="font-heading text-3xl font-bold md:text-5xl">
            Join Plexaris Today
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-neutral-500">
            Whether you&apos;re a restaurant looking to order smarter or a
            supplier ready to grow — Plexaris is built for you.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-6 sm:flex-row">
            <div className="flex flex-col items-center gap-3">
              <Button
                size="lg"
                className="bg-emerald-600 px-8 text-white hover:bg-emerald-700"
                asChild
              >
                <Link href="/signup">I&apos;m a Restaurant</Link>
              </Button>
              <span className="text-xs text-neutral-400">Free forever</span>
            </div>

            <div className="flex flex-col items-center gap-3">
              <Button
                size="lg"
                className="bg-violet-600 px-8 text-white hover:bg-violet-700"
                asChild
              >
                <Link href="/signup">I&apos;m a Supplier</Link>
              </Button>
              <span className="text-xs text-neutral-400">
                3% per transaction
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
