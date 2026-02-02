import { type NextRequest, NextResponse } from 'next/server'

type Session = {
  session: { id: string; userId: string } | null
}

const protectedRoutes = ['/dashboard', '/settings', '/profile']
const authRoutes = ['/login', '/signup']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isHomePage = pathname === '/'
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  )
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route))

  if (!isHomePage && !isProtectedRoute && !isAuthRoute) {
    return NextResponse.next()
  }

  const response = await fetch(
    `${request.nextUrl.origin}/api/auth/get-session`,
    {
      headers: {
        cookie: request.headers.get('cookie') || '',
      },
    },
  )

  const session: Session = response.ok
    ? await response.json()
    : { session: null }

  const isAuthenticated = !!session?.session

  // Home page redirects based on auth state
  if (isHomePage) {
    return NextResponse.redirect(
      new URL(isAuthenticated ? '/dashboard' : '/login', request.url),
    )
  }

  // Unauthenticated users on protected routes go to /login
  if (isProtectedRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Authenticated users on auth routes go to /dashboard
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|icon.svg).*)'],
}
