"use client"

import { useEffect, useState } from "react"
import ValuationDetail from "@/components/valuation-detail"
import UserStatus from "@/components/user-status"
import ProtectedRoute from "@/components/protected-route"
import { useAuth } from "@/contexts/auth-context"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useParams, useRouter } from "next/navigation"

export default function ValuationDetailPage() {
  const { user, getTokenBalance } = useAuth()
  const { id } = useParams()
  const router = useRouter()
  const [valuation, setValuation] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [tokenBalance, setTokenBalance] = useState(0)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchValuation = async () => {
      if (!user || !id) return

      try {
        setIsLoading(true)

        // 1. Fetch token balance
        const balance = await getTokenBalance()
        setTokenBalance(balance)

        // 2. Try fetching from kimi_appraisals first (newer)
        let { data, error } = await supabase
          .from("kimi_appraisals")
          .select("*")
          .eq("id", id)
          .single()

        if (data) {
          // Format Kimi data with all structured fields
          setValuation({
            id: data.id,
            title: data.object_name || "Kimi Appraisal",
            summary: data.context || "Initial categorization and description.",
            full_description: data.kimi_analysis?.choices?.[0]?.message?.content || "",
            created_at: data.created_at,
            is_detailed: false,
            images: data.image_urls || [],
            user_comment: data.intake_comments || "",
            assistant_response: data.kimi_analysis?.choices?.[0]?.message?.content || "",
            assistant_follow_up: "",
            type: 'kimi',
            extracted_data: {
              object_name: data.object_name,
              category: data.category,
              stylistic_period: data.stylistic_period,
              materials: data.materials,
              primary_colors: data.primary_colors,
              inscriptions_marks: data.inscriptions_marks,
              condition: data.condition,
              historical_context: data.kimi_analysis?.choices?.[0]?.message?.content
            }
          })
          return
        }

        // 3. Try standard appraisals table
        const { data: stdData, error: stdError } = await supabase
          .from("appraisals")
          .select("*")
          .eq("id", id)
          .single()

        if (stdData) {
          setValuation({
            id: stdData.id,
            title: stdData.object_name || "Antique Appraisal",
            summary: stdData.item_description || "Detailed appraisal report.",
            full_description: stdData.valuation_report?.response?.Final_Recommendations?.Next_Steps || "",
            created_at: stdData.created_at,
            is_detailed: true,
            images: stdData.image_urls || [],
            user_comment: stdData.user_comments || "",
            assistant_response: typeof stdData.valuation_report?.response === 'object'
              ? JSON.stringify(stdData.valuation_report.response, null, 2)
              : (stdData.valuation_report?.response || ""),
            assistant_follow_up: "",
            type: 'standard'
          })
        } else {
          console.error("Valuation not found")
          router.push("/my-valuations")
        }

      } catch (error) {
        console.error("Error fetching valuation detail:", error)
        router.push("/my-valuations")
      } finally {
        setIsLoading(false)
      }
    }

    fetchValuation()
  }, [user, id, supabase, getTokenBalance, router])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!valuation) return null

  return (
    <ProtectedRoute>
      <main className="flex min-h-screen flex-col items-center p-4 md:p-8">
        <div className="w-full max-w-6xl">
          <UserStatus freeValuationsLeft={0} tokenBalance={tokenBalance} />
          <ValuationDetail valuation={valuation} />
        </div>
      </main>
    </ProtectedRoute>
  )
}
