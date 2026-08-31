import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { authMiddleware } from '@/lib/auth/auth-edge'

export default authMiddleware((req) => {
  const { nextUrl } = req
  const pathname = nextUrl.pathname

  // Always allow NextAuth internal API routes
  if (pathname.startsWith('/api/auth')) {
    return NextResponse.next()
  }

  const isLoggedIn = !!req.auth
  const userRole = req.auth?.user?.role

  const isAuthRoute = pathname === '/login' || pathname === '/register'
  const isPatientRoute = pathname.startsWith('/patient')
  const isAdminRoute = pathname.startsWith('/admin')
  const isApiAdminRoute = pathname.startsWith('/api/admin')
  const isApiPatientRoute = pathname.startsWith('/api/patient') || pathname.startsWith('/api/reports')

  // If already logged in and visiting login or register, redirect to appropriate dashboard
  if (isAuthRoute && isLoggedIn) {
    if (userRole === 'ADMIN' || userRole === 'SUPER_ADMIN') {
      return NextResponse.redirect(new URL('/admin/dashboard', nextUrl))
    }
    return NextResponse.redirect(new URL('/patient/dashboard', nextUrl))
  }

  // Admin routes access control
  if (isAdminRoute || isApiAdminRoute) {
    if (!isLoggedIn) {
      const loginUrl = new URL('/login', nextUrl)
      loginUrl.searchParams.set('callbackUrl', nextUrl.pathname)
      return NextResponse.redirect(loginUrl)
    }
    if (userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN') {
      if (isApiAdminRoute) {
        return NextResponse.json({ error: 'Unauthorized: Admin privileges required' }, { status: 403 })
      }
      return NextResponse.redirect(new URL('/patient/dashboard', nextUrl))
    }
  }

  // Patient routes access control
  if (isPatientRoute || isApiPatientRoute) {
    if (!isLoggedIn) {
      if (isApiPatientRoute) {
        return NextResponse.json({ error: 'Unauthorized: Authentication required' }, { status: 401 })
      }
      const loginUrl = new URL('/login', nextUrl)
      loginUrl.searchParams.set('callbackUrl', nextUrl.pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|uploads|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
