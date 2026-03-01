import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { formatDistanceToNow } from "date-fns"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Award, ChevronRight, Camera, Tag, Clock } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { getSignedImageUrl } from "@/lib/storage-auth"

interface Valuation {
  id: string
  title: string
  summary: string
  created_at: string
  is_detailed: boolean
  type?: 'standard' | 'kimi'
  image_url?: string | null
  category?: string | null
  era?: string | null
}

interface ValuationsListProps {
  valuations: Valuation[]
}

function ValuationCard({ valuation }: { valuation: Valuation }) {
  const { t } = useLanguage()
  const [displayUrl, setDisplayUrl] = useState<string | null>(null)

  useEffect(() => {
    const resolveImage = async () => {
      if (valuation.image_url) {
        if (valuation.image_url.includes('supabase.co')) {
          const signed = await getSignedImageUrl(valuation.image_url)
          setDisplayUrl(signed)
        } else {
          setDisplayUrl(valuation.image_url)
        }
      }
    }
    resolveImage()
  }, [valuation.image_url])

  return (
    <Link href={`/my-valuations/${valuation.id}`} className="block h-full group">
      <Card className="h-full overflow-hidden border-slate-200/60 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group">
        {/* Card Image Header */}
        <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 border-b border-slate-100">
          {displayUrl ? (
            <Image
              src={displayUrl}
              alt={valuation.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              unoptimized
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-slate-300 bg-slate-50">
              <Camera className="h-10 w-10 opacity-30" />
            </div>
          )}

          {/* Overlay Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {valuation.is_detailed ? (
              <Badge className="bg-amber-600/90 text-white border-none shadow-md backdrop-blur-sm">
                <Award className="h-3 w-3 mr-1" />
                {t('badge_detailed')}
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-white/80 text-slate-800 border-none shadow-md backdrop-blur-sm">
                {t('badge_initial')}
              </Badge>
            )}
          </div>
        </div>

        <CardHeader className="p-5 pb-2">
          <div className="flex flex-col gap-1">
            <CardTitle className="text-xl font-serif font-bold text-slate-800 line-clamp-1 group-hover:text-amber-700 transition-colors">
              {valuation.title}
            </CardTitle>
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
              <Clock className="h-3 w-3" />
              {formatDistanceToNow(new Date(valuation.created_at), { addSuffix: true })}
              {valuation.era && (
                <>
                  <span className="h-1 w-1 rounded-full bg-slate-200" />
                  <span className="text-amber-600/80">{valuation.era}</span>
                </>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-5 py-2 flex-grow">
          {valuation.category && (
            <div className="flex items-center gap-1.5 mb-3">
              <Tag className="h-3 w-3 text-amber-500" />
              <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                {valuation.category}
              </span>
            </div>
          )}
          <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
            {valuation.summary}
          </p>
        </CardContent>

        <CardFooter className="px-5 py-4 border-t border-slate-50 flex justify-between items-center bg-slate-50/30">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-amber-600 transition-colors">
            {t('btn_view_details')}
          </span>
          <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-amber-500 transform group-hover:translate-x-1 transition-all" />
        </CardFooter>
      </Card>
    </Link>
  )
}

export default function ValuationsList({ valuations }: ValuationsListProps) {
  const { t } = useLanguage();

  if (valuations.length === 0) {
    return (
      <div className="text-center py-20 bg-slate-50/50 rounded-[2rem] border border-dashed border-slate-200 mt-8">
        <div className="mx-auto h-20 w-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
          <Camera className="h-10 w-10 text-slate-300" />
        </div>
        <h2 className="text-2xl font-serif font-bold text-slate-800 mb-2">{t('no_valuations_title')}</h2>
        <p className="text-slate-500 mb-8 max-w-sm mx-auto">
          {t('no_valuations_desc')}
        </p>
        <Link href="/appraise">
          <Button className="rounded-full px-8 bg-amber-600 hover:bg-amber-700 shadow-lg shadow-amber-600/20">
            {t('btn_create_first_valuation')}
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-10 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-serif font-bold text-slate-900">{t('valuations_title')}</h2>
          <p className="text-slate-500 mt-1">{valuations.length} {t('valuations_count_label') || 'valuations total'}</p>
        </div>
        <Link href="/appraise">
          <Button className="rounded-full shadow-md bg-amber-600 hover:bg-amber-700">
            {t('btn_new_valuation')}
          </Button>
        </Link>
      </div>

      <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {valuations.map((valuation) => (
          <ValuationCard key={valuation.id} valuation={valuation} />
        ))}
      </div>
    </div>
  )
}

