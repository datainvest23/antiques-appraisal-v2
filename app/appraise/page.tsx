"use client"

import { useState, useEffect } from "react"
import AppraiseAntique from "@/components/appraise-antique"
import ProtectedRoute from "@/components/protected-route"
import { useAuth } from "@/contexts/auth-context"

export default function AppraisePage() {
  const { user, _isAdmin, getTokenBalance } = useAuth()
  const [tokenBalance, setTokenBalance] = useState(0)

  useEffect(() => {
    // Fetch user's token balance
    const fetchTokenBalance = async () => {
      if (user) {
        const balance = await getTokenBalance()
        setTokenBalance(balance)
      }
    }
    
    fetchTokenBalance()
  }, [user, getTokenBalance])

  return (
    <ProtectedRoute>
      <main className="flex min-h-screen flex-col items-center p-4 md:p-8">
        <div className="w-full max-w-6xl">
          <h1 className="text-3xl font-bold mb-6">Appraise Your Antique</h1>
          <AppraiseAntique tokenBalance={tokenBalance} />
        </div>
      </main>
    </ProtectedRoute>
  )
} 