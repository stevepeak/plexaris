import { type NextRequest, NextResponse } from 'next/server'

type Session = {
  session: { id: string; userId: string } | null
}

const protectedRoutes = [
  '/dashboard',
  '/settings',
  '/profile',
  '/onboarding',
  '/order',
  '/orgs',
]
const authRoutes = ['/login', '/signup']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  )
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route))
  const isOnboarding = pathname.startsWith('/onboarding')

  if (!isProtectedRoute && !isAuthRoute) {
    return NextResponse.next()
  }

  const sessionResponse = await fetch(
    `${request.nextUrl.origin}/api/auth/get-session`,
    {
      headers: {
        cookie: request.headers.get('cookie') || '',
      },
    },
  )

  const session: Session = sessionResponse.ok
    ? await sessionResponse.json()
    : { session: null }

  const isAuthenticated = !!session?.session

  // Unauthenticated users on protected routes go to /login
  if (isProtectedRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Authenticated users on auth routes: honour redirect param or check orgs
  if (isAuthRoute && isAuthenticated) {
    const redirect = request.nextUrl.searchParams.get('redirect')
    if (redirect?.startsWith('/claim/')) {
      return NextResponse.redirect(new URL(redirect, request.url))
    }
    return NextResponse.redirect(
      new URL(hasOrgs ? '/dashboard' : '/onboarding', request.url),
    )
  }

  // Authenticated users on non-onboarding protected routes without orgs go to onboarding
  if (isProtectedRoute && !isOnboarding && isAuthenticated) {
    if (!hasOrgs) {
      return NextResponse.redirect(new URL('/onboarding', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|icon.svg).*)'],
}
