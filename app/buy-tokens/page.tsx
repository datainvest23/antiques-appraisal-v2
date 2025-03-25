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

export default function BuyTokensPage() {
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
      alert(`Successfully purchased ${selectedPlan === "small" ? "5" : "10"} tokens!`)
      router.push("/appraisal")
    } catch (err) {
      setError("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Buy Tokens</CardTitle>
            <CardDescription>Purchase tokens to create additional valuations</CardDescription>
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
                    <p className="text-base font-medium">5 Tokens</p>
                    <p className="text-sm text-muted-foreground">Perfect for occasional use</p>
                  </div>
                  <div className="text-lg font-bold">$5</div>
                </Label>
              </div>

              <div
                className={`flex items-center space-x-4 rounded-lg border p-4 ${selectedPlan === "large" ? "border-primary bg-primary/5" : ""}`}
              >
                <RadioGroupItem value="large" id="large" />
                <Label htmlFor="large" className="flex flex-1 cursor-pointer items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-base font-medium">10 Tokens</p>
                    <p className="text-sm text-muted-foreground">Best value - Save 10%</p>
                  </div>
                  <div className="text-lg font-bold">$9</div>
                </Label>
              </div>
            </RadioGroup>

            <div className="rounded-lg bg-muted p-4">
              <div className="flex items-center space-x-2">
                <Coins className="h-5 w-5 text-primary" />
                <h3 className="font-medium">Token Usage</h3>
              </div>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                <li>• 1 token = 1 standard valuation</li>
                <li>• Detailed valuations cost $3 each</li>
                <li>• Remember: You get 1 free valuation daily</li>
              </ul>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button onClick={handlePurchase} className="w-full" disabled={loading}>
              {loading ? "Processing..." : "Proceed to Payment"}
              {!loading && <CreditCard className="ml-2 h-4 w-4" />}
            </Button>
            <Button variant="outline" className="w-full" onClick={() => router.back()}>
              Cancel
            </Button>
          </CardFooter>
        </Card>
      </div>
    </ProtectedRoute>
  )
}

