import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Award, ChevronRight } from "lucide-react"

interface Valuation {
  id: string
  title: string
  summary: string
  created_at: string
  is_detailed: boolean
}

interface ValuationsListProps {
  valuations: Valuation[]
}

export default function ValuationsList({ valuations }: ValuationsListProps) {
  if (valuations.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-2">No Valuations Yet</h2>
        <p className="text-muted-foreground mb-6">
          Upload images of your antiques to get started with your first valuation.
        </p>
        <Link href="/appraise">
          <Button>Create Your First Valuation</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">My Valuations</h2>
        <Link href="/appraise">
          <Button>New Valuation</Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {valuations.map((valuation) => (
          <Link href={`/my-valuations/${valuation.id}`} key={valuation.id}>
            <Card className="h-full overflow-hidden hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{valuation.title}</CardTitle>
                  {valuation.is_detailed && (
                    <Badge variant="secondary" className="flex items-center">
                      <Award className="h-3 w-3 mr-1" />
                      Detailed
                    </Badge>
                  )}
                </div>
                <CardDescription>
                  {formatDistanceToNow(new Date(valuation.created_at), { addSuffix: true })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm line-clamp-3">{valuation.summary}</p>
              </CardContent>
              <CardFooter className="pt-2">
                <Button variant="ghost" size="sm" className="ml-auto">
                  View Details
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}

