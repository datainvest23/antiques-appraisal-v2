"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Award, Copy, Share2, UserPlus, Check, Gift } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function ReferralSystem() {
  const [copied, setCopied] = useState(false)

  // Mock data - in a real app, this would come from the database
  const referralCode = "ANTIQUE" + Math.random().toString(36).substring(2, 8).toUpperCase()
  const referralLink = `${window.location.origin}/signup?ref=${referralCode}`

  const mockReferrals = [
    { id: 1, name: "Sarah Johnson", date: "2023-03-15", status: "Completed", reward: "Premium Valuation" },
    { id: 2, name: "Michael Chen", date: "2023-03-10", status: "Signed Up", reward: "Pending" },
    { id: 3, name: "Emma Wilson", date: "2023-02-28", status: "Completed", reward: "Premium Valuation" },
  ]

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareReferral = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join Antiques Appraisal",
          text: "Get expert valuations for your antique items! Use my referral code for a free valuation.",
          url: referralLink,
        })
      } catch (err) {
        console.error("Error sharing:", err)
      }
    } else {
      copyToClipboard()
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Award className="mr-2 h-5 w-5 text-primary" />
            Refer Friends & Earn Premium Valuations
          </CardTitle>
          <CardDescription>
            Share your unique referral link with friends. When they sign up and complete their first valuation, you'll
            receive a free premium valuation (worth $3).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Gift className="h-5 w-5 text-primary" />
              <h3 className="font-medium">Your Rewards</h3>
            </div>
            <ul className="space-y-1 text-sm">
              <li className="flex items-center">
                <Check className="h-4 w-4 text-primary mr-2" />
                <span>1 premium valuation for each friend who signs up</span>
              </li>
              <li className="flex items-center">
                <Check className="h-4 w-4 text-primary mr-2" />
                <span>No limit on how many friends you can refer</span>
              </li>
              <li className="flex items-center">
                <Check className="h-4 w-4 text-primary mr-2" />
                <span>Premium valuations include enhanced detail and provenance research</span>
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <label htmlFor="referral-link" className="text-sm font-medium">
              Your Referral Link
            </label>
            <div className="flex space-x-2">
              <Input id="referral-link" value={referralLink} readOnly className="font-mono text-sm" />
              <Button variant="outline" size="icon" onClick={copyToClipboard} className="flex-shrink-0">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button onClick={shareReferral} className="w-full">
              <Share2 className="mr-2 h-4 w-4" />
              Share Referral Link
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <UserPlus className="mr-2 h-5 w-5 text-primary" />
            Your Referrals
          </CardTitle>
          <CardDescription>Track the status of your referrals and rewards</CardDescription>
        </CardHeader>
        <CardContent>
          {mockReferrals.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Reward</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockReferrals.map((referral) => (
                  <TableRow key={referral.id}>
                    <TableCell>{referral.name}</TableCell>
                    <TableCell>{new Date(referral.date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          referral.status === "Completed"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {referral.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      {referral.reward === "Pending" ? (
                        <span className="text-muted-foreground">Pending</span>
                      ) : (
                        <span className="text-primary font-medium">{referral.reward}</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-6">
              <UserPlus className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
              <p className="mt-2 text-muted-foreground">No referrals yet. Share your link to get started!</p>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Alert className="w-full">
            <AlertDescription>
              Premium valuations will be automatically added to your account once your referred friend completes their
              first valuation.
            </AlertDescription>
          </Alert>
        </CardFooter>
      </Card>
    </div>
  )
}

