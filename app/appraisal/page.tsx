"use client"

import { useState, useEffect } from "react"
import AppraiseAntique from "@/components/appraise-antique"
import ProtectedRoute from "@/components/protected-route"
import { useAuth } from "@/contexts/auth-context"

export default function AppraisalPage() {
  const { user, isAdmin, getTokenBalance } = useAuth()
  const [freeValuationsLeft, setFreeValuationsLeft] = useState(1)
  const [tokenBalance, setTokenBalance] = useState(0)

  useEffect(() => {
    // Fetch user's token balance
    const fetchTokenBalance = async () => {
      if (user) {
        const balance = await getTokenBalance()
        setTokenBalance(balance)
        
        // For admin users, set unlimited free valuations
        if (isAdmin) {
          setFreeValuationsLeft(999) // Effectively unlimited
        }
      }
    }
    
    fetchTokenBalance()
  }, [user, isAdmin, getTokenBalance])

  return (
    <ProtectedRoute>
    <main className="flex min-h-screen flex-col items-center p-4 md:p-8">
      <div className="w-full max-w-6xl">
          {/* Clean layout focusing on the appraisal interface */}
          <AppraiseAntique 
            userId={user?.id || ""} 
            freeValuationsLeft={freeValuationsLeft} 
            tokenBalance={tokenBalance} 
          />
      </div>
    </main>
    </ProtectedRoute>
  )
}

