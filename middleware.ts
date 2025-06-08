import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Middleware function to handle authentication and route protection
 * - Refreshes auth session if available
 * - Redirects unauthenticated users away from protected routes
 * - Redirects authenticated users away from auth routes (login)
 */
export async function middleware(req: NextRequest) {
  // Create a response object that we can modify
  const res = NextResponse.next()
  
  // Create a Supabase client specifically for the middleware
  const supabase = createMiddlewareClient({ req, res })
  
  // Refresh session if expired
  const { data: { session } } = await supabase.auth.getSession()
  
  // Current path info
  const path = req.nextUrl.pathname
  
  // Define route types
  const isProtectedRoute = 
    path.startsWith('/appraise') || 
    path.startsWith('/my-valuations') || 
    path.startsWith('/profile')
  
  const isAuthRoute = 
    path === '/login' || 
    path === '/verification-sent' ||
    path === '/forgot-password'
  
  // Public routes that don't need special handling
  const isPublicRoute = 
    path === '/' || 
    path.startsWith('/auth/callback') ||
    path.startsWith('/api/') ||
    path.startsWith('/_next/') ||
    path === '/reset-password'
  
  // Handle protected routes - redirect to login if not authenticated
  if (isProtectedRoute && !session) {
    const redirectUrl = new URL('/login', req.url)
    // Optional: Add redirect back URL as a parameter
    redirectUrl.searchParams.set('redirect', path)
    return NextResponse.redirect(redirectUrl)
  }
  
  // Handle auth routes - redirect to main app if already authenticated
  // Note: We don't redirect from reset-password page even when authenticated
  if (isAuthRoute && session && path !== '/forgot-password') {
    return NextResponse.redirect(new URL('/appraise', req.url))
  }
  
  // For everything else, continue with enhanced response
  // (session refresh tokens handled by Supabase client)
  return res
}

/**
 * Define which routes this middleware should apply to
 * Include all routes that need authentication checks
 */
export const config = {
  matcher: [
    // Protected routes
    '/appraise/:path*',
    '/my-valuations/:path*',
    '/profile/:path*',
    
    // Auth routes
    '/login',
    '/verification-sent',
  ],
} 