'use i18n'
'use client'

import { Fingerprint, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'

export function PasskeyStep({
  onSetup,
  onSkip,
  isLoading,
  error,
}: {
  onSetup: () => void
  onSkip: () => void
  isLoading: boolean
  error: string | null
}) {
  return (
    <div className="grid w-full max-w-lg gap-6 text-center">
      <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Fingerprint className="size-8" />
      </div>

      <div className="grid gap-2">
        <h2 className="text-lg font-semibold">Set up a passkey</h2>
        <p className="text-sm text-muted-foreground">
          Passkeys let you sign in with your fingerprint, face, or device PIN
          instead of a password. They're faster and more secure.
        </p>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button onClick={onSetup} disabled={isLoading} className="w-full">
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Setting up...
          </>
        ) : (
          <>
            <Fingerprint className="h-4 w-4" />
            Set up passkey
          </>
        )}
      </Button>

      <Button
        variant="link"
        onClick={onSkip}
        disabled={isLoading}
        className="w-full"
      >
        Skip for now
      </Button>
    </div>
  )
}
