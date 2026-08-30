import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/auth'

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth
  const userRole = req.auth?.user?.role

  const isAuthRoute = nextUrl.pathname === '/login' || nextUrl.pathname === '/register'
  const isPatientRoute = nextUrl.pathname.startsWith('/patient')
  const isAdminRoute = nextUrl.pathname.startsWith('/admin')
  const isApiAdminRoute = nextUrl.pathname.startsWith('/api/admin')
  const isApiPatientRoute = nextUrl.pathname.startsWith('/api/patient') || nextUrl.pathname.startsWith('/api/reports')

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
