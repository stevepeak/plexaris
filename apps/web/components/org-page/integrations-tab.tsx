'use client'

import { ArrowRightLeft, Package, ShoppingCart, Warehouse } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

const INTEGRATIONS = [
  {
    name: 'Ordering Systems',
    description: 'Sync orders automatically from your existing platforms',
    icon: ShoppingCart,
    examples: ['Lightspeed', 'Choco', 'FoodNotify'],
  },
  {
    name: 'Inventory Systems',
    description: 'Keep stock levels in sync across all your tools',
    icon: Warehouse,
    examples: ['MarketMan', 'Apicbase', 'Procuros'],
  },
  {
    name: 'ERP & Accounting',
    description: 'Connect your back-office for seamless data flow',
    icon: Package,
    examples: ['Exact Online', 'Xero', 'SAP'],
  },
]

interface IntegrationsTabProps {
  organizationId?: string
}

export function IntegrationsTab(_props: IntegrationsTabProps) {
  return (
    <div className="relative flex min-h-[calc(100vh-8rem)] items-center justify-center overflow-hidden">
      {/* Background pattern with edge fade */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          maskImage:
            'radial-gradient(ellipse at center, black 40%, transparent 80%)',
          WebkitMaskImage:
            'radial-gradient(ellipse at center, black 40%, transparent 80%)',
        }}
      >
        {/* Gradient base */}
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/15 via-transparent to-amber-500/15" />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(128,128,128,1) 1px, transparent 1px), linear-gradient(90deg, rgba(128,128,128,1) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        {/* Animated glowing orbs */}
        <div className="absolute left-1/4 top-1/4 h-64 w-64 animate-pulse rounded-full bg-pink-500/20 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-64 w-64 animate-pulse rounded-full bg-amber-500/20 blur-3xl [animation-delay:1s]" />
        {/* Connection lines */}
        <svg className="absolute inset-0 h-full w-full opacity-[0.1]">
          <line
            x1="10%"
            y1="20%"
            x2="90%"
            y2="80%"
            stroke="currentColor"
            strokeWidth="1"
            strokeDasharray="8 8"
          />
          <line
            x1="90%"
            y1="20%"
            x2="10%"
            y2="80%"
            stroke="currentColor"
            strokeWidth="1"
            strokeDasharray="8 8"
          />
          <line
            x1="50%"
            y1="0%"
            x2="50%"
            y2="100%"
            stroke="currentColor"
            strokeWidth="1"
            strokeDasharray="8 8"
          />
        </svg>
      </div>

      {/* Floating integration icons */}
      <div className="absolute left-[15%] top-[25%] flex items-center gap-2.5 -rotate-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border/40 bg-muted/60 shadow-sm backdrop-blur-sm">
          <ArrowRightLeft className="h-5 w-5 text-pink-400" />
        </div>
        <div className="rounded-2xl rounded-tl-sm border border-border/40 bg-card/70 px-3.5 py-2.5 text-sm text-muted-foreground shadow-sm backdrop-blur-sm">
          Sync orders in real-time
        </div>
      </div>
      <div className="absolute right-[12%] top-[30%] flex items-center gap-2.5 rotate-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border/40 bg-muted/60 shadow-sm backdrop-blur-sm">
          <Warehouse className="h-5 w-5 text-amber-400" />
        </div>
        <div className="rounded-2xl rounded-tl-sm border border-border/40 bg-card/70 px-3.5 py-2.5 text-sm text-muted-foreground shadow-sm backdrop-blur-sm">
          Auto-update inventory levels
        </div>
      </div>
      <div className="absolute bottom-[25%] left-[12%] flex items-center gap-2.5 rotate-1">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border/40 bg-muted/60 shadow-sm backdrop-blur-sm">
          <Package className="h-5 w-5 text-emerald-400" />
        </div>
        <div className="rounded-2xl rounded-tl-sm border border-border/40 bg-card/70 px-3.5 py-2.5 text-sm text-muted-foreground shadow-sm backdrop-blur-sm">
          Connect your ERP system
        </div>
      </div>
      <div className="absolute bottom-[30%] right-[15%] flex items-center gap-2.5 -rotate-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border/40 bg-muted/60 shadow-sm backdrop-blur-sm">
          <ShoppingCart className="h-5 w-5 text-violet-400" />
        </div>
        <div className="rounded-2xl rounded-tl-sm border border-border/40 bg-card/70 px-3.5 py-2.5 text-sm text-muted-foreground shadow-sm backdrop-blur-sm">
          Import from ordering platforms
        </div>
      </div>

      {/* Coming soon pill + blurred card */}
      <div className="relative z-10 flex w-full max-w-lg flex-col items-center">
        <span className="mb-4 rounded-full border border-pink-500/30 bg-pink-500/10 px-4 py-1.5 text-sm font-medium text-pink-400">
          Coming soon
        </span>
        <div className="pointer-events-none w-full select-none blur-[6px]">
          <Card className="w-full border-border/50 bg-card/80 shadow-2xl backdrop-blur-sm">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold tracking-tight">
                Integrations
              </CardTitle>
              <CardDescription className="text-base">
                Connect to 3rd party ordering systems and inventory systems to
                keep your data in sync.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {INTEGRATIONS.map((integration) => {
                const Icon = integration.icon
                return (
                  <div
                    key={integration.name}
                    className="flex items-start gap-4 rounded-lg border border-border/50 p-4"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{integration.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {integration.description}
                      </p>
                      <p className="text-xs text-muted-foreground/70">
                        {integration.examples.join(' · ')}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="ml-auto shrink-0"
                    >
                      Connect
                    </Button>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
