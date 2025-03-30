import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * This route handler processes OAuth and email verification callbacks from Supabase
 * It is used for:
 * 1. Email verification when users sign up
 * 2. OAuth login flows (e.g., Google, GitHub, etc.)
 * 3. Password reset flows
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  
  if (code) {
    // Create a Supabase client for the server component
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    // Exchange the code for a session
    await supabase.auth.exchangeCodeForSession(code)
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(new URL('/appraise', request.url))
} 