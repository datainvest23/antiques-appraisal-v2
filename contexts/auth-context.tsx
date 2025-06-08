"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { User, Session } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

type AuthContextType = {
  user: User | null
  session: Session | null
  isAdmin: boolean
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, firstName?: string, lastName?: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClientComponentClient<Database>()

  useEffect(() => {
    const setData = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          throw error
        }
        
        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          // Check if user is admin
          const { data, error } = await supabase
            .from('users')
            .select('user_type')
            .eq('user_id', session.user.id)
            .single()
          
          if (!error && data && data.user_type === 'admin') {
            setIsAdmin(true)
          }
        }
      } catch (error) {
        console.error('Error fetching session:', error)
      } finally {
        setIsLoading(false)
      }
    }

    // Call setData on mount
    setData()
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setIsLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) throw error
      
      // Set the user and session immediately
      setUser(data.user)
      setSession(data.session)
      
      // Check if user is admin
      if (data.user) {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('user_type')
          .eq('user_id', data.user.id)
          .single()
        
        if (!userError && userData && userData.user_type === 'admin') {
          setIsAdmin(true)
        }
        
        // Update last_login timestamp
        await supabase
          .from('users')
          .update({ last_login: new Date().toISOString() })
          .eq('user_id', data.user.id)
      }
      
      // Let middleware handle the redirects instead of doing it here
      // The router will be managed by the middleware now
    } catch (error: any) {
      console.error('Error signing in:', error.message)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const signUp = async (email: string, password: string, firstName?: string, lastName?: string) => {
    try {
      setIsLoading(true)
      const { data: { user }, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `https://antiquesapp.pro/auth/callback`,
        },
      })
      
      if (error) throw error
      
      // Create user profile and token balance
      if (user) {
        // Insert into users table
        await supabase
          .from('users')
          .insert({
            user_id: user.id,
            email: user.email || '',
            user_type: 'user',
            first_name: firstName || null,
            last_name: lastName || null,
            profile_data: {}
          })
      }
      
      router.push('/verification-sent')
    } catch (error: any) {
      console.error('Error signing up:', error.message)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setIsLoading(true)
      const { error } = await supabase.auth.signOut()
      
      if (error) throw error
      
      // Clear local state
      setUser(null)
      setSession(null)
      setIsAdmin(false)
      
      // Let middleware handle the redirection via the auth state change
      router.refresh() 
    } catch (error: any) {
      console.error('Error signing out:', error.message)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const value = {
    user,
    session,
    isAdmin,
    isLoading,
    signIn,
    signUp,
    signOut
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  
  return context
} 