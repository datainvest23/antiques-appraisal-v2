"use client"

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export function AuthCheck({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const checkAuth = async () => {
      const { data, error } = await supabase.auth.getSession()
      setIsAuthenticated(!!data.session)
      setIsLoading(false)
    }

    checkAuth()

    // Subscribe to auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session)
      setIsLoading(false)
    })

    return () => {
      authListener?.subscription.unsubscribe()
    }
  }, [supabase.auth])

  const handleLogin = () => {
    router.push('/login')
  }

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading...</div>
  }

  if (!isAuthenticated) {
    return (
      <div className="container max-w-lg mx-auto py-8 px-4">
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Authentication Required</AlertTitle>
          <AlertDescription>
            You need to be logged in to use this feature. Please sign in to continue.
          </AlertDescription>
        </Alert>
        <Button onClick={handleLogin} className="w-full">Log In</Button>
      </div>
    )
  }

  return <>{children}</>
} 