'use client'

import { Mail, MapPin, Phone } from 'lucide-react'
import { useEffect, useState } from 'react'

import { PendingInvitations } from '@/components/pending-invitations'
import {
  type ScrapeIssue,
  ScrapeIssuesTable,
} from '@/components/scrape-issues-table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

type OrgDetails = {
  name: string
  type: 'supplier' | 'horeca'
  description: string | null
  logoUrl: string | null
  phone: string | null
  email: string | null
  address: string | null
  deliveryAddress: string | null
  deliveryAreas: string | null
}

function getInitials(name: string | undefined): string {
  if (!name) return '?'
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function DashboardTab({
  organizationId,
  orgName,
  orgType,
  orgRole,
  onInvitationAccepted,
}: {
  organizationId: string
  orgName: string
  orgType: 'supplier' | 'horeca'
  orgRole: string
  onInvitationAccepted?: () => void
}) {
  const [orgDetails, setOrgDetails] = useState<OrgDetails | null>(null)
  const [scrapeIssues, setScrapeIssues] = useState<ScrapeIssue[]>([])

  useEffect(() => {
    setOrgDetails(null)
    void fetch(`/api/organizations/${organizationId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.organization) setOrgDetails(data.organization)
        if (data?.scrapeIssues) setScrapeIssues(data.scrapeIssues)
      })
  }, [organizationId])

  return (
    <div className="space-y-6">
      <PendingInvitations onAccepted={onInvitationAccepted} />

      <div>
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12 rounded-lg">
            {orgDetails?.logoUrl && (
              <AvatarImage
                src={orgDetails.logoUrl}
                alt={`${orgName} logo`}
                className="object-cover"
              />
            )}
            <AvatarFallback className="rounded-lg text-sm font-medium">
              {getInitials(orgName)}
            </AvatarFallback>
          </Avatar>
          <div className="grid gap-1">
            <h2 className="text-lg font-semibold">{orgName}</h2>
            <div className="flex gap-2">
              <Badge variant="secondary" className="capitalize">
                {orgType}
              </Badge>
              <Badge variant="outline" className="capitalize">
                {orgRole}
              </Badge>
            </div>
          </div>
        </div>

        {orgDetails &&
          (orgDetails.description ||
            orgDetails.email ||
            orgDetails.phone ||
            orgDetails.address ||
            orgDetails.deliveryAreas ||
            orgDetails.deliveryAddress) && (
            <>
              <Separator className="my-6" />
              <div className="grid gap-4">
                {orgDetails.description && (
                  <p className="text-sm text-muted-foreground">
                    {orgDetails.description}
                  </p>
                )}
                {(orgDetails.email ||
                  orgDetails.phone ||
                  orgDetails.address) && (
                  <div className="grid gap-2 text-sm">
                    {orgDetails.email && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="h-4 w-4 shrink-0" />
                        <span>{orgDetails.email}</span>
                      </div>
                    )}
                    {orgDetails.phone && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-4 w-4 shrink-0" />
                        <span>{orgDetails.phone}</span>
                      </div>
                    )}
                    {orgDetails.address && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4 shrink-0" />
                        <span>{orgDetails.address}</span>
                      </div>
                    )}
                  </div>
                )}
                {orgDetails.deliveryAreas && (
                  <div className="grid gap-1">
                    <h3 className="text-sm font-medium">Delivery Areas</h3>
                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>{orgDetails.deliveryAreas}</span>
                    </div>
                  </div>
                )}
                {orgDetails.deliveryAddress && (
                  <div className="grid gap-1">
                    <h3 className="text-sm font-medium">Delivery Address</h3>
                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>{orgDetails.deliveryAddress}</span>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
      </div>

      {scrapeIssues.length > 0 && <ScrapeIssuesTable issues={scrapeIssues} />}
    </div>
  )
}
