import { type NextRequest, NextResponse } from 'next/server'

type Session = {
  session: { id: string; userId: string } | null
}

const protectedRoutes = ['/dashboard', '/settings', '/profile', '/onboarding']
const authRoutes = ['/login', '/signup']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isHomePage = pathname === '/'
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  )
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route))
  const isOnboarding = pathname.startsWith('/onboarding')

  if (!isHomePage && !isProtectedRoute && !isAuthRoute) {
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

  // Home page redirects based on auth state
  if (isHomePage) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    // Authenticated: check if user has orgs
    const hasOrgs = await userHasOrganizations(request)
    return NextResponse.redirect(
      new URL(hasOrgs ? '/dashboard' : '/onboarding', request.url),
    )
  }

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
    const hasOrgs = await userHasOrganizations(request)
    return NextResponse.redirect(
      new URL(hasOrgs ? '/dashboard' : '/onboarding', request.url),
    )
  }

  // Authenticated users on non-onboarding protected routes without orgs go to onboarding
  if (isProtectedRoute && !isOnboarding && isAuthenticated) {
    const hasOrgs = await userHasOrganizations(request)
    if (!hasOrgs) {
      return NextResponse.redirect(new URL('/onboarding', request.url))
    }
  }

  return NextResponse.next()
}

async function userHasOrganizations(request: NextRequest): Promise<boolean> {
  const response = await fetch(
    `${request.nextUrl.origin}/api/organizations/mine`,
    {
      headers: {
        cookie: request.headers.get('cookie') || '',
      },
    },
  )

  if (!response.ok) return false

  const data = await response.json()
  return Array.isArray(data.organizations) && data.organizations.length > 0
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|icon.svg).*)'],
}
