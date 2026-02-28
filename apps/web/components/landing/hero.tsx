import Link from 'next/link'

import { Button } from '@/components/ui/button'

export function Hero() {
  return (
    <section className="relative overflow-hidden py-20 md:py-32">
      {/* Background effects */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          maskImage:
            'radial-gradient(ellipse at center, black 40%, transparent 80%)',
          WebkitMaskImage:
            'radial-gradient(ellipse at center, black 40%, transparent 80%)',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-transparent to-cyan-500/10" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(128,128,128,1) 1px, transparent 1px), linear-gradient(90deg, rgba(128,128,128,1) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        <div className="absolute left-1/4 top-1/4 h-64 w-64 animate-pulse rounded-full bg-violet-500/10 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-64 w-64 animate-pulse rounded-full bg-cyan-500/10 blur-3xl [animation-delay:1s]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 text-center sm:px-6 lg:px-8">
        <h1 className="font-heading text-5xl font-bold leading-tight tracking-tight text-neutral-900 md:text-7xl">
          AI-Powered Ordering
          <br />
          <span className="bg-gradient-to-r from-violet-600 to-cyan-600 bg-clip-text text-transparent">
            for Food Service
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg text-neutral-500 md:text-xl">
          Order like you&apos;re texting a colleague. Plexaris connects HoReCa
          buyers with food suppliers through natural voice and text — powered by
          AI that understands your kitchen.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button
            size="lg"
            className="bg-neutral-900 px-8 text-white hover:bg-neutral-800"
            asChild
          >
            <Link href="/signup">Sign Up Free</Link>
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="border-neutral-300 px-8 text-neutral-700 hover:bg-neutral-50"
            asChild
          >
            <a href="#how-it-works">Learn More &rarr;</a>
          </Button>
        </div>
      </div>
    </section>
  )
}
