'use client'

import { LogOut, Settings } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { OrgNameStep } from '@/components/onboarding/org-name-step'
import { OrgTypeStep } from '@/components/onboarding/org-type-step'
import { StepProgress } from '@/components/onboarding/step-progress'
import { getSteps, type OrgType } from '@/components/onboarding/types'
import { OrgSwitcher, useActiveOrg } from '@/components/org-switcher'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { authClient } from '@/lib/auth-client'

function getInitials(name: string | undefined): string {
  if (!name) {
    return '?'
  }
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export default function OnboardingPage() {
  const router = useRouter()
  const { data: session, isPending } = authClient.useSession()
  const {
    organizations,
    activeOrg,
    switchOrg,
    isPending: orgsPending,
  } = useActiveOrg()
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [orgType, setOrgType] = useState<OrgType | null>(null)
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSignOut = async () => {
    await authClient.signOut()
    router.push('/login')
  }

  const steps = getSteps(orgType)
  const currentStep = steps[currentStepIndex]

  const handleTypeSelect = (type: OrgType) => {
    setOrgType(type)
    setCurrentStepIndex(1)
  }

  const handleBack = () => {
    setError(null)
    if (currentStepIndex === 1) {
      setOrgType(null)
    }
    setCurrentStepIndex((prev) => Math.max(0, prev - 1))
  }

  const handleSubmit = async () => {
    if (!orgType || !name.trim()) return

    setIsLoading(true)
    setError(null)

    const response = await fetch('/api/organizations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim(), type: orgType }),
    })

    const data = await response.json()

    if (!response.ok) {
      setError(data.error ?? 'Failed to create organization')
      setIsLoading(false)
      return
    }

    router.push(`/orgs/${data.organization.id}`)
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-lg font-semibold">
              Plexaris
            </Link>
            <Separator orientation="vertical" className="h-6" />
            <OrgSwitcher
              organizations={organizations}
              activeOrg={activeOrg}
              onSwitch={switchOrg}
              isPending={orgsPending}
            />
          </div>
          {isPending ? (
            <Skeleton className="h-8 w-8 rounded-full" />
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {getInitials(session?.user.name)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-medium">{session?.user.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {session?.user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/settings/profile">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </header>

      <main className="flex flex-col items-center justify-center gap-8 p-4 py-16">
        <div className="text-center">
          <h1 className="text-2xl font-semibold">Create your organization</h1>
          <p className="mt-2 text-muted-foreground">
            {currentStep.id === 'type'
              ? 'What type of business are you?'
              : 'Almost there — just give it a name'}
          </p>
        </div>

        <StepProgress steps={steps} currentStepIndex={currentStepIndex} />

        {currentStep.id === 'type' && (
          <OrgTypeStep selected={orgType} onSelect={handleTypeSelect} />
        )}

        {currentStep.id === 'name' && orgType && (
          <OrgNameStep
            orgType={orgType}
            name={name}
            onNameChange={setName}
            onBack={handleBack}
            onSubmit={handleSubmit}
            isLoading={isLoading}
            error={error}
          />
        )}
      </main>
    </div>
  )
}
