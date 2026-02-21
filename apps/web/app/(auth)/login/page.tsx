'use client'

import { Fingerprint } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'

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

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect')
  const [email, setEmail] = useState(searchParams.get('email') ?? '')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [passkeyLoading, setPasskeyLoading] = useState(false)
  const [supportsPasskey, setSupportsPasskey] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && window.PublicKeyCredential) {
      setSupportsPasskey(true)
    }
  }, [])

  const handlePasskeySignIn = async () => {
    setPasskeyLoading(true)
    setError(null)
    const { error: err } = await authClient.signIn.passkey()
    if (err) {
      setError(err.message ?? 'Passkey authentication failed')
      setPasskeyLoading(false)
      return
    }
    router.push(redirect ?? '/dashboard')
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const { error } = await authClient.signIn.email({
      email,
      password,
    })

    if (error) {
      setError(error.message ?? 'Invalid credentials')
      setIsLoading(false)
      return
    }

    router.push(redirect ?? '/dashboard')
  }

  const signupHref = redirect
    ? `/signup?redirect=${encodeURIComponent(redirect)}`
    : '/signup'

  return (
    <Card className="relative w-full max-w-md bg-white dark:bg-card">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Sign in</CardTitle>
        <CardDescription>
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link
                href="/forgot-password"
                className="text-sm text-muted-foreground underline-offset-4 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="Your password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>

        {supportsPasskey && (
          <>
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">or</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handlePasskeySignIn}
              disabled={passkeyLoading}
              className="group relative flex w-full items-center justify-center gap-3 rounded-lg border border-border/60 bg-gradient-to-b from-card to-muted/30 px-4 py-3 text-sm font-medium shadow-sm transition-all duration-200 hover:border-primary/40 hover:shadow-md hover:shadow-primary/5 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
            >
              <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 transition-colors duration-200 group-hover:bg-primary/15">
                <Fingerprint className="size-4 text-primary" />
              </span>
              <span>
                {passkeyLoading ? 'Verifying...' : 'Sign in with passkey'}
              </span>
            </button>
          </>
        )}
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link
            href={signupHref}
            className="text-primary underline-offset-4 hover:underline"
          >
            Sign up
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}

function LoginFallback() {
  return (
    <Card className="relative w-full max-w-md bg-white dark:bg-card">
      <CardHeader className="text-center">
        <Skeleton className="mx-auto h-7 w-32" />
        <Skeleton className="mx-auto mt-2 h-4 w-56" />
      </CardHeader>
      <CardContent className="grid gap-4">
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-full" />
      </CardContent>
    </Card>
  )
}

export default function LoginPage() {
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
        <h1 className="font-bruno text-4xl tracking-wide text-foreground">
          Plexaris
        </h1>
        <Suspense fallback={<LoginFallback />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}
