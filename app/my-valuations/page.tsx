"use client"

import { useEffect, useState } from "react"
import ValuationsList from "@/components/valuations-list"
import UserStatus from "@/components/user-status"
import ReferralBanner from "@/components/referral-banner"
import ProtectedRoute from "@/components/protected-route"
import { useAuth } from "@/contexts/auth-context"
import { useLanguage } from "@/contexts/language-context"
import { mockValuationsByLanguage } from "@/lib/translations"

export default function MyValuationsPage() {
  const { user, getTokenBalance } = useAuth()
  const [freeValuationsLeft] = useState(1)
  const [tokenBalance, setTokenBalance] = useState(0)
  const { language } = useLanguage()
  const mockValuations = mockValuationsByLanguage[language]

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
          {/* Banners in a 50/50 horizontal layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <UserStatus freeValuationsLeft={freeValuationsLeft} tokenBalance={tokenBalance} />
            <ReferralBanner />
          </div>
          <ValuationsList valuations={mockValuations} />
        </div>
      </main>
    </ProtectedRoute>
  )
}
