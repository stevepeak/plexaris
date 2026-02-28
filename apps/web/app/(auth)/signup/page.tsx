'use i18n'
'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'

import { LanguageSwitcher } from '@/components/language-switcher'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { authClient } from '@/lib/auth-client'

function SignupForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const { error } = await authClient.signUp.email({
      email,
      password,
      name,
    })

    if (error) {
      setError(error.message ?? 'Failed to create account')
      setIsLoading(false)
      return
    }

    router.push(redirect ?? '/onboarding')
  }

  return (
    <Card className="relative w-full max-w-md bg-white dark:bg-card">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Create an account</CardTitle>
        <CardDescription>
          Enter your details to get started with Plexaris
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSignup} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Full name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Jane Doe"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Min. 8 characters"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? (
              <span>Creating account...</span>
            ) : (
              <span>Sign up</span>
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?{' '}
          <a
            href={
              redirect
                ? `/login?redirect=${encodeURIComponent(redirect)}`
                : '/login'
            }
            className="text-primary underline-offset-4 hover:underline"
          >
            Sign in
          </a>
        </p>
      </CardFooter>
    </Card>
  )
}

function SignupFallback() {
  return (
    <Card className="relative w-full max-w-md bg-white dark:bg-card">
      <CardHeader className="text-center">
        <Skeleton className="mx-auto h-7 w-48" />
        <Skeleton className="mx-auto mt-2 h-4 w-64" />
      </CardHeader>
      <CardContent className="grid gap-4">
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-full" />
      </CardContent>
    </Card>
  )
}

export default function SignupPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
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
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/15 via-transparent to-cyan-500/15" />
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(128,128,128,1) 1px, transparent 1px), linear-gradient(90deg, rgba(128,128,128,1) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        <div className="absolute left-1/4 top-1/4 h-64 w-64 animate-pulse rounded-full bg-violet-500/20 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-64 w-64 animate-pulse rounded-full bg-cyan-500/20 blur-3xl [animation-delay:1s]" />
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

      <div className="relative flex flex-col items-center gap-6">
        <h1
          className="font-bruno text-4xl tracking-wide text-foreground"
          data-lingo-override={{ nl: 'Plexaris' }}
        >
          Plexaris
        </h1>
        <Suspense fallback={<SignupFallback />}>
          <SignupForm />
        </Suspense>
        <LanguageSwitcher />
      </div>
    </div>
  )
}
