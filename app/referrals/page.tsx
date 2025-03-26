"use client"

import { useEffect, useState } from "react"
import ReferralSystem from "@/components/referral-system"
import UserStatus from "@/components/user-status"
import ProtectedRoute from "@/components/protected-route"
import { useAuth } from "@/contexts/auth-context"

export default function ReferralsPage() {
  const { user, getTokenBalance } = useAuth()
  const [freeValuationsLeft] = useState(1)
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
          <UserStatus freeValuationsLeft={freeValuationsLeft} tokenBalance={tokenBalance} />
          <ReferralSystem />
        </div>
      </main>
    </ProtectedRoute>
  )
}

