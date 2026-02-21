'use client'

import Link from 'next/link'
import { useState } from 'react'

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
import { authClient } from '@/lib/auth-client'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const { error } = await authClient.requestPasswordReset({
      email,
      redirectTo: '/reset-password',
    })

    if (error) {
      setError('Unable to send reset email. Please try again later.')
      setIsLoading(false)
      return
    }

    setSubmitted(true)
    setIsLoading(false)
  }

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
        <Card className="relative w-full max-w-md bg-white dark:bg-card">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Forgot password</CardTitle>
            <CardDescription>
              {submitted
                ? 'Check your email for a reset link'
                : 'Enter your email to receive a password reset link'}
            </CardDescription>
          </CardHeader>
          {!submitted && (
            <CardContent>
              <form onSubmit={handleSubmit} className="grid gap-4">
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
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? 'Sending...' : 'Send reset link'}
                </Button>
              </form>
            </CardContent>
          )}
          <CardFooter className="justify-center">
            <p className="text-sm text-muted-foreground">
              Remember your password?{' '}
              <Link
                href="/login"
                className="text-primary underline-offset-4 hover:underline"
              >
                Sign in
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
