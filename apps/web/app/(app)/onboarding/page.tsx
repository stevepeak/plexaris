'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { OrgNameStep } from '@/components/onboarding/org-name-step'
import { OrgTypeStep } from '@/components/onboarding/org-type-step'
import { StepProgress } from '@/components/onboarding/step-progress'
import { getSteps, type OrgType } from '@/components/onboarding/types'

export default function OnboardingPage() {
  const router = useRouter()
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [orgType, setOrgType] = useState<OrgType | null>(null)
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const steps = getSteps(orgType)
  const currentStep = steps[currentStepIndex]

  const handleTypeSelect = (type: OrgType) => {
    setOrgType(type)
    setCurrentStepIndex(1)
  }

  const handleBack = () => {
    setError(null)
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

    if (!response.ok) {
      const data = await response.json()
      setError(data.error ?? 'Failed to create organization')
      setIsLoading(false)
      return
    }

    router.push('/dashboard')
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-4">
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
    </div>
  )
}
