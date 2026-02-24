'use client'

import { MessageSquare, Mic, Sparkles } from 'lucide-react'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const features = [
  {
    value: 'voice',
    icon: Mic,
    label: 'Voice Ordering',
    title: 'Order with Your Voice',
    description:
      'Just speak naturally. "I need 20kg of chicken breast and 5 cases of olive oil by Friday." Our AI understands context, quantities, and delivery preferences.',
  },
  {
    value: 'text',
    icon: MessageSquare,
    label: 'Text Commands',
    title: 'Text Like You Chat',
    description:
      'Send orders through a chat interface that feels as natural as messaging a supplier. Copy-paste from your prep list, type shorthand — Plexaris understands it all.',
  },
  {
    value: 'recommendations',
    icon: Sparkles,
    label: 'Smart Recommendations',
    title: 'AI That Knows Your Kitchen',
    description:
      'Plexaris learns your ordering patterns, suggests reorders before you run out, and surfaces better-priced alternatives from verified suppliers.',
  },
]

export function Features() {
  return (
    <section className="py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="font-heading text-3xl font-bold md:text-5xl">
            How You&apos;ll Order
          </h2>
          <p className="mt-4 text-neutral-500">
            Three ways to place orders — all powered by AI
          </p>
        </div>

        <Tabs defaultValue="voice" className="mt-12">
          <TabsList className="mx-auto grid w-full max-w-lg grid-cols-3 bg-neutral-100">
            {features.map((f) => (
              <TabsTrigger
                key={f.value}
                value={f.value}
                className="gap-2 data-[state=active]:bg-white data-[state=active]:text-neutral-900 data-[state=active]:shadow-sm"
              >
                <f.icon className="size-4" />
                <span className="hidden sm:inline">{f.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {features.map((f) => (
            <TabsContent key={f.value} value={f.value} className="mt-8">
              <div className="mx-auto max-w-2xl rounded-xl border border-neutral-200 bg-neutral-50 p-8 text-center">
                <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-lg bg-violet-100">
                  <f.icon className="size-6 text-violet-600" />
                </div>
                <h3 className="font-heading text-xl font-semibold">
                  {f.title}
                </h3>
                <p className="mt-3 text-neutral-500">{f.description}</p>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  )
}
