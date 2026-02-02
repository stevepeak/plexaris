'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'

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

  const handleDemoUser = async () => {
    setIsLoading(true)
    setError(null)

    const demoEmail = 'demo@plexaris.com'
    const demoPassword = 'demo-password-123'
    const demoName = 'Demo User'

    // Try signing in first (demo user may already exist)
    const signInResult = await authClient.signIn.email({
      email: demoEmail,
      password: demoPassword,
    })

    if (!signInResult.error) {
      router.push(redirect ?? '/onboarding')
      return
    }

    // If sign-in fails, create the demo account
    const { error } = await authClient.signUp.email({
      email: demoEmail,
      password: demoPassword,
      name: demoName,
    })

    if (error) {
      setError(error.message ?? 'Failed to create demo account')
      setIsLoading(false)
      return
    }

    router.push(redirect ?? '/onboarding')
  }

  return (
    <Card className="w-full max-w-md">
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
            {isLoading ? 'Creating account...' : 'Sign up'}
          </Button>
        </form>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">Or</span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          disabled={isLoading}
          onClick={handleDemoUser}
        >
          Enter Demo User
        </Button>
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
    <Card className="w-full max-w-md">
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
    <div className="flex min-h-screen items-center justify-center p-4">
      <Suspense fallback={<SignupFallback />}>
        <SignupForm />
      </Suspense>
    </div>
  )
}
