'use client'

import { LogOut, Mail, User } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { authClient } from '@/lib/auth-client'

function getInitials(name: string | undefined): string {
  if (!name) return '?'
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export default function DashboardPage() {
  const router = useRouter()
  const { data: session, isPending } = authClient.useSession()

  const handleSignOut = async () => {
    await authClient.signOut()
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
          <span className="text-lg font-semibold">Plexaris</span>
          {isPending ? (
            <Skeleton className="h-8 w-8 rounded-full" />
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">
                {session?.user.name}
              </span>
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs">
                  {getInitials(session?.user.name)}
                </AvatarFallback>
              </Avatar>
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">
        {isPending ? (
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent className="grid gap-4">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-56" />
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="text-lg">
                    {getInitials(session?.user.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-xl">
                    {session?.user.name}
                  </CardTitle>
                  <CardDescription>Welcome to your dashboard</CardDescription>
                </div>
              </div>
            </CardHeader>
            <Separator />
            <CardContent className="grid gap-4 pt-6">
              <div className="flex items-center gap-3 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Name:</span>
                <span>{session?.user.name}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Email:</span>
                <span>{session?.user.email}</span>
              </div>
              <Separator />
              <Button
                variant="outline"
                onClick={handleSignOut}
                className="w-fit"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
