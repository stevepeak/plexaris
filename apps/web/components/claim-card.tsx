'use client'

import { Building2, CheckCircle2, Mail, MapPin, Phone } from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface OrganizationPreview {
  id: string
  name: string
  type: string
  status: string
  description: string | null
  logoUrl: string | null
  phone: string | null
  email: string | null
  address: string | null
}

export interface ClaimPreviewData {
  organization: OrganizationPreview
  claimEmail: string
}

export type ClaimCardState =
  | { status: 'loading' }
  | { status: 'preview'; data: ClaimPreviewData }
  | { status: 'claiming'; data: ClaimPreviewData }
  | { status: 'claimed'; orgName: string }
  | { status: 'error'; code: number; message: string }

interface ClaimCardProps {
  state: ClaimCardState
  isAuthenticated: boolean
  onClaim: () => void
  onSignUp: () => void
  onGoHome: () => void
  onGoToDashboard: () => void
  signUpHref: string
  loginHref: string
}

export function ClaimCard({
  state,
  isAuthenticated,
  onClaim,
  onSignUp,
  onGoHome,
  onGoToDashboard,
  signUpHref,
  loginHref,
}: ClaimCardProps) {
  if (state.status === 'loading') {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="mt-2 h-4 w-64" />
        </CardHeader>
        <CardContent className="grid gap-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardContent>
      </Card>
    )
  }

  if (state.status === 'error') {
    const errorTitle =
      state.code === 404
        ? 'Token not found'
        : state.code === 410
          ? 'Token expired'
          : state.code === 409
            ? 'Already claimed'
            : 'Error'

    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{errorTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTitle>{errorTitle}</AlertTitle>
            <AlertDescription>{state.message}</AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter className="justify-center">
          <Button variant="outline" onClick={onGoHome}>
            Go home
          </Button>
        </CardFooter>
      </Card>
    )
  }

  if (state.status === 'claimed') {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Organization claimed</CardTitle>
          <CardDescription>
            You are now the owner of {state.orgName}.
          </CardDescription>
        </CardHeader>
        <CardFooter className="justify-center">
          <Button onClick={onGoToDashboard}>Go to dashboard</Button>
        </CardFooter>
      </Card>
    )
  }

  const { organization, claimEmail } = state.data
  const isClaiming = state.status === 'claiming'

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Claim your organization</CardTitle>
        <CardDescription>
          Review the details below and claim ownership of this supplier profile.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
            <Building2 className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="grid gap-0.5">
            <p className="font-semibold">{organization.name}</p>
            <Badge variant="secondary" className="w-fit">
              {organization.type}
            </Badge>
          </div>
        </div>

        {organization.description && (
          <p className="text-sm text-muted-foreground">
            {organization.description}
          </p>
        )}

        <div className="grid gap-2 text-sm">
          {organization.email && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-4 w-4 shrink-0" />
              <span>{organization.email}</span>
            </div>
          )}
          {organization.phone && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-4 w-4 shrink-0" />
              <span>{organization.phone}</span>
            </div>
          )}
          {organization.address && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4 shrink-0" />
              <span>{organization.address}</span>
            </div>
          )}
        </div>

        <p className="text-xs text-muted-foreground">
          Claim link sent to {claimEmail}
        </p>

        {!isAuthenticated && (
          <Alert>
            <AlertTitle>Sign in required</AlertTitle>
            <AlertDescription>
              You need an account to claim this organization.{' '}
              <a
                href={signUpHref}
                className="text-primary underline-offset-4 hover:underline"
              >
                Sign up
              </a>{' '}
              or{' '}
              <a
                href={loginHref}
                className="text-primary underline-offset-4 hover:underline"
              >
                log in
              </a>{' '}
              to continue.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter>
        {isAuthenticated ? (
          <Button className="w-full" disabled={isClaiming} onClick={onClaim}>
            {isClaiming ? 'Claiming...' : 'Claim organization'}
          </Button>
        ) : (
          <Button className="w-full" onClick={onSignUp}>
            Sign up to claim
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
