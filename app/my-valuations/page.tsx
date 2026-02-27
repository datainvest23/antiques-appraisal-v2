"use client"

import { useEffect, useState } from "react"
import ValuationsList from "@/components/valuations-list"
import UserStatus from "@/components/user-status"
import ReferralBanner from "@/components/referral-banner"
import ProtectedRoute from "@/components/protected-route"
import { useAuth } from "@/contexts/auth-context"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export default function MyValuationsPage() {
  const { user, getTokenBalance } = useAuth()
  const [valuations, setValuations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [freeValuationsLeft] = useState(1)
  const [tokenBalance, setTokenBalance] = useState(0)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return

      try {
        setIsLoading(true)

        // 1. Fetch token balance
        const balance = await getTokenBalance()
        setTokenBalance(balance)

        // 2. Fetch appraisals from both tables
        const [appraisalsRes, kimiRes] = await Promise.all([
          supabase.from("appraisals").select("*").eq("user_id", user.id),
          supabase.from("kimi_appraisals").select("*").eq("user_id", user.id)
        ])

        // 3. Process and merge
        const standardAppraisals = (appraisalsRes.data || []).map(a => ({
          id: a.id,
          title: a.object_name || "General Appraisal",
          summary: a.item_description || "Detailed appraisal of your antique item.",
          created_at: a.created_at,
          is_detailed: true,
          type: 'standard'
        }))

        const kimiAppraisals = (kimiRes.data || []).map(a => ({
          id: a.id,
          title: a.object_name || "Kimi Appraisal",
          summary: a.intake_comments || "Initial categorization and description.",
          created_at: a.created_at,
          is_detailed: false,
          type: 'kimi'
        }))

        const combined = [...standardAppraisals, ...kimiAppraisals].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )

        setValuations(combined)
      } catch (error) {
        console.error("Error fetching valuations:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [user, getTokenBalance, supabase])

  return (
    <ProtectedRoute>
      <main className="flex min-h-screen flex-col items-center p-4 md:p-8">
        <div className="w-full max-w-6xl">
          {/* Banners in a 50/50 horizontal layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <UserStatus freeValuationsLeft={freeValuationsLeft} tokenBalance={tokenBalance} />
            <ReferralBanner />
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <ValuationsList valuations={valuations} />
          )}
        </div>
      </main>
    </ProtectedRoute>
  )
}

