'use i18n'
'use client'

import { Bot, Eye, Package, Settings, ShoppingCart, Users } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

import { PendingInvitations } from '@/components/pending-invitations'
import {
  type ScrapeIssue,
  ScrapeIssuesTable,
} from '@/components/scrape-issues-table'
import {
  SupplierProfileCard,
  type SupplierProfileCardState,
} from '@/components/supplier-profile-card'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

type OrgCounts = {
  products: number
  members: number
  orders: number
  agentRuns: number
}

function OnboardingTitle({ text }: { text: string }) {
  switch (text) {
    case 'Add your first product':
      return <span>Add your first product</span>
    case 'Invite your team':
      return <span>Invite your team</span>
    case 'Start your first order':
      return <span>Start your first order</span>
    case 'Run your first AI agent':
      return <span>Run your first AI agent</span>
    default:
      return <span>{text}</span>
  }
}

function OnboardingDescription({ text }: { text: string }) {
  switch (text) {
    case 'Start building your catalog so customers can discover and order from you.':
      return (
        <span>
          Start building your catalog so customers can discover and order from
          you.
        </span>
      )
    case 'Collaborate with your colleagues by inviting them to your organization.':
      return (
        <span>
          Collaborate with your colleagues by inviting them to your
          organization.
        </span>
      )
    case 'Browse suppliers and products to place your first order.':
      return (
        <span>Browse suppliers and products to place your first order.</span>
      )
    case 'Use AI agents to keep your product catalog up to date automatically.':
      return (
        <span>
          Use AI agents to keep your product catalog up to date automatically.
        </span>
      )
    default:
      return <span>{text}</span>
  }
}

export function DashboardTab({
  organizationId,
  orgName,
  orgType,
  onInvitationAccepted,
}: {
  organizationId: string
  orgName: string
  orgType: 'supplier' | 'horeca'
  onInvitationAccepted?: () => void
}) {
  const [profileState, setProfileState] = useState<SupplierProfileCardState>({
    status: 'loading',
  })
  const [counts, setCounts] = useState<OrgCounts | null>(null)
  const [scrapeIssues, setScrapeIssues] = useState<ScrapeIssue[]>([])

  useEffect(() => {
    setProfileState({ status: 'loading' })
    setCounts(null)
    void fetch(`/api/organizations/${organizationId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.organization) {
          const org = data.organization
          setProfileState({
            status: 'loaded',
            supplier: {
              id: org.id,
              name: org.name,
              type: org.type,
              claimed: org.claimed ?? true,
              description: org.description,
              logoUrl: org.logoUrl,
              phone: org.phone,
              email: org.email,
              address: org.address,
              deliveryAreas: org.deliveryAreas,
            },
          })
        }
        if (data?.counts) setCounts(data.counts)
        if (data?.scrapeIssues) setScrapeIssues(data.scrapeIssues)
      })
  }, [organizationId])

  const onboardingCards = getOnboardingCards(organizationId, orgType, counts)

  return (
    <div className="relative min-h-[calc(100vh-8rem)] overflow-hidden">
      {/* Background pattern (same as integrations page) */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          maskImage:
            'radial-gradient(ellipse at center, black 40%, transparent 80%)',
          WebkitMaskImage:
            'radial-gradient(ellipse at center, black 40%, transparent 80%)',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/15 via-transparent to-amber-500/15" />
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(128,128,128,1) 1px, transparent 1px), linear-gradient(90deg, rgba(128,128,128,1) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        <div className="absolute left-1/4 top-1/4 h-64 w-64 animate-pulse rounded-full bg-pink-500/20 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-64 w-64 animate-pulse rounded-full bg-amber-500/20 blur-3xl [animation-delay:1s]" />
      </div>

      {/* Content */}
      <div className="relative z-10 space-y-6">
        <PendingInvitations onAccepted={onInvitationAccepted} />

        <SupplierProfileCard
          state={profileState}
          header={
            orgType === 'supplier' ? (
              <div className="flex items-center gap-2 border-b bg-muted px-6 py-3 text-sm text-muted-foreground">
                <Eye className="h-4 w-4 shrink-0" />
                <span>
                  This is how horeca customers see your profile. Update details
                  in{' '}
                  <Link
                    href={`/orgs/${organizationId}/settings`}
                    className="inline-flex items-center gap-1 font-medium text-foreground underline decoration-muted-foreground/60 decoration-wavy underline-offset-4 transition-all hover:underline-offset-2"
                  >
                    <Settings className="h-3.5 w-3.5" />
                    Settings
                  </Link>
                </span>
              </div>
            ) : undefined
          }
        />

        {onboardingCards.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2">
            {onboardingCards.map((card) => (
              <Link key={card.href} href={card.href}>
                <Card className="group h-full transition-colors hover:border-primary/50">
                  <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${card.iconBg}`}
                    >
                      <card.icon className={`h-5 w-5 ${card.iconColor}`} />
                    </div>
                    <div className="grid gap-1">
                      <CardTitle className="text-base">
                        <OnboardingTitle text={card.title} />
                      </CardTitle>
                      <CardDescription>
                        <OnboardingDescription text={card.description} />
                      </CardDescription>
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {scrapeIssues.length > 0 && <ScrapeIssuesTable issues={scrapeIssues} />}
      </div>
    </div>
  )
}

type OnboardingCard = {
  href: string
  title: string
  description: string
  icon: typeof Package
  iconBg: string
  iconColor: string
}

function getOnboardingCards(
  organizationId: string,
  orgType: 'supplier' | 'horeca',
  counts: OrgCounts | null,
): OnboardingCard[] {
  if (!counts) return []

  const cards: OnboardingCard[] = []

  if (orgType === 'supplier' && counts.products === 0) {
    cards.push({
      href: `/orgs/${organizationId}/products/new`,
      title: 'Add your first product',
      description:
        'Start building your catalog so customers can discover and order from you.',
      icon: Package,
      iconBg: 'bg-blue-500/10',
      iconColor: 'text-blue-500',
    })
  }

  if (counts.members <= 1) {
    cards.push({
      href: `/orgs/${organizationId}/members`,
      title: 'Invite your team',
      description:
        'Collaborate with your colleagues by inviting them to your organization.',
      icon: Users,
      iconBg: 'bg-green-500/10',
      iconColor: 'text-green-500',
    })
  }

  if (orgType === 'horeca' && counts.orders === 0) {
    cards.push({
      href: '/order',
      title: 'Start your first order',
      description: 'Browse suppliers and products to place your first order.',
      icon: ShoppingCart,
      iconBg: 'bg-amber-500/10',
      iconColor: 'text-amber-500',
    })
  }

  if (orgType === 'supplier' && counts.agentRuns === 0) {
    cards.push({
      href: `/orgs/${organizationId}/agents/runs`,
      title: 'Run your first AI agent',
      description:
        'Use AI agents to keep your product catalog up to date automatically.',
      icon: Bot,
      iconBg: 'bg-purple-500/10',
      iconColor: 'text-purple-500',
    })
  }

  return cards
}
