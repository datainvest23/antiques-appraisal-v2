import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Award, ChevronRight } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

interface Valuation {
  id: string
  title: string
  summary: string
  created_at: string
  is_detailed: boolean
  type?: 'standard' | 'kimi'
}

interface ValuationsListProps {
  valuations: Valuation[]
}

export default function ValuationsList({ valuations }: ValuationsListProps) {
  const { t } = useLanguage();
  if (valuations.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-2">{t('no_valuations_title')}</h2>
        <p className="text-muted-foreground mb-6">
          {t('no_valuations_desc')}
        </p>
        <Link href="/appraise">
          <Button>{t('btn_create_first_valuation')}</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{t('valuations_title')}</h2>
        <Link href="/appraise">
          <Button>{t('btn_new_valuation')}</Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {valuations.map((valuation) => (
          <Link href={`/my-valuations/${valuation.id}`} key={valuation.id}>
            <Card className="h-full overflow-hidden hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start gap-2">
                  <CardTitle className="text-lg line-clamp-1">{valuation.title}</CardTitle>
                  <div className="flex shrink-0">
                    {valuation.is_detailed ? (
                      <Badge className="bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100">
                        <Award className="h-3 w-3 mr-1" />
                        {t('badge_detailed')}
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="hover:bg-secondary">
                        {t('badge_initial')}
                      </Badge>
                    )}
                  </div>
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
                  {t('btn_view_details')}
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

