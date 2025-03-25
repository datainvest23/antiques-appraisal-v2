"use client"

import { useEffect, useState } from "react"
import ValuationsList from "@/components/valuations-list"
import UserStatus from "@/components/user-status"
import ReferralBanner from "@/components/referral-banner"
import ProtectedRoute from "@/components/protected-route"
import { useAuth } from "@/contexts/auth-context"

// Mock data for preview
const mockValuations = [
  {
    id: "1",
    title: "Victorian Mahogany Side Table",
    summary:
      "Mid-19th century Victorian mahogany side table (c.1840-1860) with ornate carvings and original brass hardware. Good condition with expected patina and minor surface wear.",
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    is_detailed: true,
  },
  {
    id: "2",
    title: "Art Deco Silver Jewelry Box",
    summary:
      "1930s Art Deco silver-plated jewelry box with geometric patterns and original velvet lining. Some tarnishing but overall good condition.",
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    is_detailed: false,
  },
  {
    id: "3",
    title: "Tiffany Style Stained Glass Lamp",
    summary:
      "Early 20th century Tiffany-inspired stained glass table lamp with floral pattern. Original wiring has been replaced, minor chips to glass in two sections.",
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
    is_detailed: true,
  },
]

export default function MyValuationsPage() {
  const { user, getTokenBalance } = useAuth()
  const [freeValuationsLeft, setFreeValuationsLeft] = useState(1)
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

