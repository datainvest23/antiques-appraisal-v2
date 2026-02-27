import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Award, ArrowRight } from "lucide-react"

export default function ReferralBanner() {
  return (
    <Card className="bg-primary/5 border-primary/20 h-full">
      <CardContent className="flex flex-col justify-between p-4 h-full">
        <div>
          <div className="flex items-center mb-2">
            <Award className="h-6 w-6 text-primary mr-2 flex-shrink-0" />
            <h3 className="font-bold text-md">Refer a Friend</h3>
          </div>
          <p className="text-sm text-muted-foreground">Share your referral link and earn premium valuations</p>
        </div>
        <div className="mt-4">
          <Link href="/referrals">
            <Button size="sm">
              Start Referring
              <ArrowRight className="ml-2 h-3 w-3" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

