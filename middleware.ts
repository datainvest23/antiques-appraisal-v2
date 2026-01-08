import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { i18n } from './i18n-config'

// Helper to get locale
function getLocale(request: NextRequest): string {
  // Simple logic for now: default to 'en'
  // In a real app, you would parse the Accept-Language header
  return i18n.defaultLocale
}

/**
 * Middleware function to handle authentication and route protection
 * - Refreshes auth session if available
 * - Redirects unauthenticated users away from protected routes
 * - Redirects authenticated users away from auth routes (login)
 */
export async function middleware(req: NextRequest) {
  // Create a response object that we can modify
  const res = NextResponse.next()
  
  // 1. Locale Handling
  const pathname = req.nextUrl.pathname

  // Check if it's a public file (like images, api, etc.)
  const isPublicFile =
    pathname.includes('.') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/auth/callback')

  // Check if pathname is missing any locale
  const pathnameIsMissingLocale = i18n.locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  )

  if (pathnameIsMissingLocale && !isPublicFile) {
    const locale = getLocale(req)

    // Redirect to the same path with locale
    return NextResponse.redirect(
      new URL(`/${locale}${pathname === '/' ? '' : pathname}`, req.url)
    )
  }

  // If it's a public file, we skip the rest (unless we want auth check on public files?)
  // Auth check logic below needs to know if we are on a localized path

  // Create a Supabase client specifically for the middleware
  const supabase = createMiddlewareClient({ req, res })
  
  // Refresh session if expired
  const { data: { session } } = await supabase.auth.getSession()
  
  // Parse path to remove locale for auth checks
  // If we are here, and not isPublicFile, we likely have a locale or we are on the redirect loop (which shouldn't happen if we return above)
  
  let pathWithoutLocale = pathname
  let currentLocale = i18n.defaultLocale

  if (!isPublicFile && !pathnameIsMissingLocale) {
      const segments = pathname.split('/')
      // segments[0] is empty, segments[1] is locale
      currentLocale = segments[1]
      pathWithoutLocale = '/' + segments.slice(2).join('/')
  }

  // Define route types
  const isProtectedRoute = 
    pathWithoutLocale.startsWith('/appraise') ||
    pathWithoutLocale.startsWith('/my-valuations') ||
    pathWithoutLocale.startsWith('/referrals') ||
    pathWithoutLocale.startsWith('/buy-tokens') ||
    pathWithoutLocale.startsWith('/profile')
  
  const isAuthRoute = 
    pathWithoutLocale === '/login' ||
    pathWithoutLocale === '/verification-sent' ||
    pathWithoutLocale === '/forgot-password'
  
  
  // Handle protected routes - redirect to login if not authenticated
  if (isProtectedRoute && !session) {
    const redirectUrl = new URL(`/${currentLocale}/login`, req.url)
    // Optional: Add redirect back URL as a parameter
    // We want to redirect back to the localized path
    redirectUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(redirectUrl)
  }
  
  // Handle auth routes - redirect to main app if already authenticated
  // Note: We don't redirect from reset-password page even when authenticated
  if (isAuthRoute && session && pathWithoutLocale !== '/forgot-password') {
    return NextResponse.redirect(new URL(`/${currentLocale}/appraise`, req.url))
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
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
