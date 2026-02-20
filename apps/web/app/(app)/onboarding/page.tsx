'use client'

import { LogOut, Settings } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { OrgNameStep } from '@/components/onboarding/org-name-step'
import { OrgTypeStep } from '@/components/onboarding/org-type-step'
import { PasskeyStep } from '@/components/onboarding/passkey-step'
import { SourcesStep } from '@/components/onboarding/sources-step'
import { StepProgress } from '@/components/onboarding/step-progress'
import { getSteps, type OrgType } from '@/components/onboarding/types'
import { OrgSwitcher, useActiveOrg } from '@/components/org-switcher'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
import { trpc } from '@/lib/trpc'

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

function getSubtitle(stepId: string): string {
  switch (stepId) {
    case 'type':
      return 'What type of business are you?'
    case 'name':
      return 'Almost there — just give it a name'
    case 'sources':
      return 'Optionally share your website and documents'
    default:
      return ''
  }
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
  const [passkeyDone, setPasskeyDone] = useState(false)
  const [passkeyLoading, setPasskeyLoading] = useState(false)
  const [passkeyError, setPasskeyError] = useState<string | null>(null)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [orgType, setOrgType] = useState<OrgType | null>(null)
  const [name, setName] = useState('')
  const [urls, setUrls] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const scrapeMutation = trpc.trigger.scrapeOrganization.useMutation()

  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      typeof window.PublicKeyCredential === 'undefined'
    ) {
      setPasskeyDone(true)
    }
  }, [])

  const handlePasskeySetup = async () => {
    setPasskeyLoading(true)
    setPasskeyError(null)
    const { error: err } = await authClient.passkey.addPasskey({
      name: session?.user.email ?? 'Passkey',
    })
    if (err) {
      setPasskeyError(err.message ?? 'Failed to set up passkey')
    } else {
      setPasskeyDone(true)
    }
    setPasskeyLoading(false)
  }

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

  const handleNameNext = () => {
    if (!name.trim()) return
    setCurrentStepIndex(2)
  }

  const handleSubmit = async () => {
    if (!orgType || !name.trim()) return

    setIsLoading(true)
    setError(null)

    // Create the organization with URLs
    const response = await fetch('/api/organizations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name.trim(),
        type: orgType,
        urls: urls.trim() || undefined,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      setError(data.error ?? 'Failed to create organization')
      setIsLoading(false)
      return
    }

    const orgId = data.organization.id

    // Upload files if any
    if (files.length > 0) {
      const formData = new FormData()
      for (const file of files) {
        formData.append('files', file)
      }

      const uploadResponse = await fetch(`/api/organizations/${orgId}/files`, {
        method: 'POST',
        body: formData,
      })

      if (!uploadResponse.ok) {
        const uploadData = await uploadResponse.json()
        setError(uploadData.error ?? 'Failed to upload files')
        setIsLoading(false)
        return
      }
    }

    // Trigger the scraping workflow if URLs or files were provided
    const hasUrls = urls.trim().length > 0
    const hasFiles = files.length > 0
    if (hasUrls || hasFiles) {
      try {
        await scrapeMutation.mutateAsync({ organizationId: orgId })
      } catch {
        // Non-blocking — the org is created, scrape can be retried later
      }
    }

    router.push(`/orgs/${orgId}`)
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
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
                    <AvatarImage
                      src={session?.user.image ?? undefined}
                      alt={session?.user.name ?? ''}
                    />
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
        {!passkeyDone ? (
          <PasskeyStep
            onSetup={handlePasskeySetup}
            onSkip={() => setPasskeyDone(true)}
            isLoading={passkeyLoading}
            error={passkeyError}
          />
        ) : (
          <>
            <div className="text-center">
              <h1 className="text-2xl font-semibold">
                Create your organization
              </h1>
              <p className="mt-2 text-muted-foreground">
                {getSubtitle(currentStep.id)}
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
                onSubmit={handleNameNext}
              />
            )}

            {currentStep.id === 'sources' && orgType && (
              <SourcesStep
                orgType={orgType}
                urls={urls}
                onUrlsChange={setUrls}
                files={files}
                onFilesChange={setFiles}
                onBack={handleBack}
                onSubmit={handleSubmit}
                isLoading={isLoading}
                error={error}
              />
            )}
          </>
        )}
      </main>
    </div>
  )
}
