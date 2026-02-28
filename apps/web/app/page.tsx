import { CTA } from '@/components/landing/cta'
import { Features } from '@/components/landing/features'
import { Footer } from '@/components/landing/footer'
import { ForHoreca } from '@/components/landing/for-horeca'
import { ForSuppliers } from '@/components/landing/for-suppliers'
import { Hero } from '@/components/landing/hero'
import { HowItWorks } from '@/components/landing/how-it-works'
import { Integrations } from '@/components/landing/integrations'
import { Navbar } from '@/components/landing/navbar'
import { PainPoints } from '@/components/landing/pain-points'
import { Pricing } from '@/components/landing/pricing'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white font-body text-neutral-900">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <PainPoints />
      <ForSuppliers />
      <Integrations />
      <ForHoreca />
      <Pricing />
      <CTA />
      <Footer />
    </main>
  )
}
