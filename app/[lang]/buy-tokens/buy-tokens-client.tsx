"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Coins, CreditCard, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import ProtectedRoute from "@/components/protected-route"

export default function BuyTokensClient({ dictionary }: { dictionary: any }) {
  const [selectedPlan, setSelectedPlan] = useState<"small" | "large">("small")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handlePurchase = async () => {
    setLoading(true)
    setError(null)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // For preview, just show success and redirect
      alert(dictionary.successMessage.replace("{count}", selectedPlan === "small" ? "5" : "10"))
      router.push("/appraise")
    } catch (error) {
      console.error('Error fetching token balance:', error)
      setError(dictionary.errorFetch)
    } finally {
      setLoading(false)
    }
  }

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">{dictionary.title}</CardTitle>
            <CardDescription>{dictionary.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <RadioGroup
              value={selectedPlan}
              onValueChange={(value) => setSelectedPlan(value as "small" | "large")}
              className="space-y-4"
            >
              <div
                className={`flex items-center space-x-4 rounded-lg border p-4 ${selectedPlan === "small" ? "border-primary bg-primary/5" : ""}`}
              >
                <RadioGroupItem value="small" id="small" />
                <Label htmlFor="small" className="flex flex-1 cursor-pointer items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-base font-medium">{dictionary.plans.small.title}</p>
                    <p className="text-sm text-muted-foreground">{dictionary.plans.small.description}</p>
                  </div>
                  <div className="text-lg font-bold">{dictionary.plans.small.price}</div>
                </Label>
              </div>

              <div
                className={`flex items-center space-x-4 rounded-lg border p-4 ${selectedPlan === "large" ? "border-primary bg-primary/5" : ""}`}
              >
                <RadioGroupItem value="large" id="large" />
                <Label htmlFor="large" className="flex flex-1 cursor-pointer items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-base font-medium">{dictionary.plans.large.title}</p>
                    <p className="text-sm text-muted-foreground">{dictionary.plans.large.description}</p>
                  </div>
                  <div className="text-lg font-bold">{dictionary.plans.large.price}</div>
                </Label>
              </div>
            </RadioGroup>

            <div className="rounded-lg bg-muted p-4">
              <div className="flex items-center space-x-2">
                <Coins className="h-5 w-5 text-primary" />
                <h3 className="font-medium">{dictionary.usage.title}</h3>
              </div>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                <li>{dictionary.usage.point1}</li>
                <li>{dictionary.usage.point2}</li>
                <li>{dictionary.usage.point3}</li>
              </ul>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button onClick={handlePurchase} className="w-full" disabled={loading}>
              {loading ? dictionary.buttons.process : dictionary.buttons.proceed}
              {!loading && <CreditCard className="ml-2 h-4 w-4" />}
            </Button>
            <Button variant="outline" className="w-full" onClick={() => router.back()}>
              {dictionary.buttons.cancel}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </ProtectedRoute>
  )
}
