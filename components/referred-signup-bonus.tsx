import { Card, CardContent } from "@/components/ui/card"
import { Award, Check } from "lucide-react"

interface ReferredSignupBonusProps {
  referrerName?: string
}

export default function ReferredSignupBonus({ referrerName }: ReferredSignupBonusProps) {
  return (
    <Card className="bg-primary/5 border-primary/20 mb-6">
      <CardContent className="flex items-center p-4">
        <Award className="h-10 w-10 text-primary mr-4 flex-shrink-0" />
        <div>
          <h3 className="font-bold text-lg">You've Been Referred!</h3>
          <p className="text-sm">
            {referrerName
              ? `${referrerName} invited you to join Antiques Appraisal.`
              : "You've been invited to join Antiques Appraisal."}
          </p>
          <ul className="mt-2">
            <li className="flex items-center text-sm">
              <Check className="h-4 w-4 text-primary mr-2" />
              <span>You'll get 1 free standard valuation</span>
            </li>
            <li className="flex items-center text-sm">
              <Check className="h-4 w-4 text-primary mr-2" />
              <span>Your friend will receive a premium valuation when you complete your first appraisal</span>
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}

