import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { formatDistanceToNow } from "date-fns"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Award, ChevronRight, Camera, Tag, Clock, Sparkles, Loader2, X, Download } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { getSignedImageUrl } from "@/lib/storage-auth"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { processMarkdownResponse } from "@/lib/markdown"
import { useToast } from "@/components/ui/use-toast"

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
  image_urls?: string[]
}

interface ValuationsListProps {
  valuations: Valuation[]
}

function ValuationCard({ valuation }: { valuation: Valuation }) {
  const { t } = useLanguage()
  const { toast } = useToast()
  const [displayUrl, setDisplayUrl] = useState<string | null>(null)
  const [isDeepAnalyzing, setIsDeepAnalyzing] = useState(false)
  const [deepResult, setDeepResult] = useState("")
  const [showDeepModal, setShowDeepModal] = useState(false)

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

  const handleDeepValuation = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    try {
      setIsDeepAnalyzing(true)
      setDeepResult("")
      setShowDeepModal(true)

      // Resolve all images to signed URLs for the API
      const imagesToProcess = valuation.image_urls || (valuation.image_url ? [valuation.image_url] : [])
      const resolvedUrls = await Promise.all(
        imagesToProcess.map(async (url) => {
          if (url.includes('supabase.co')) return await getSignedImageUrl(url)
          return url
        })
      )

      const response = await fetch('/api/valuation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          purpose: 'Auction Estimate',
          basisOfValue: 'Market Value',
          currency: 'USD',
          objectDetails: {
            name: valuation.title,
            category: valuation.category,
            era: valuation.era,
            summary: valuation.summary
          },
          imageUrls: resolvedUrls
        })
      })

      if (!response.ok) throw new Error('Deep analysis failed')

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No readable stream')

      const decoder = new TextDecoder()
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        setDeepResult(prev => prev + chunk)
      }
    } catch (error: any) {
      console.error('Deep Analysis Error:', error)
      toast({
        title: "Analysis Failed",
        description: error.message,
        variant: "destructive"
      })
      setShowDeepModal(false)
    } finally {
      setIsDeepAnalyzing(false)
    }
  }

  return (
    <>
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

            {/* Deep Valuation Action */}
            <div className="absolute bottom-3 right-3">
              <Button
                size="sm"
                variant="secondary"
                disabled={isDeepAnalyzing}
                onClick={handleDeepValuation}
                className="h-8 rounded-full bg-black/60 hover:bg-black/80 text-white border-none backdrop-blur-md text-[10px] uppercase font-bold tracking-wider px-3 shadow-lg opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0"
              >
                {isDeepAnalyzing ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Sparkles className="h-3 w-3 mr-1 text-amber-400" />}
                Deep Valuation
              </Button>
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

      <Dialog open={showDeepModal} onOpenChange={setShowDeepModal}>
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0 overflow-hidden border-white/10 shadow-2xl">
          <div className="sr-only">
            <DialogTitle>Deep Valuation Report</DialogTitle>
            <DialogDescription>A comprehensive AI-powered appraisal report with historical context and market analysis.</DialogDescription>
          </div>

          <div className="flex items-center justify-between p-6 border-b bg-slate-900 text-white">
            <div className="flex items-center gap-3">
              <Sparkles className="h-6 w-6 text-amber-400" />
              <div>
                <h3 className="text-lg font-serif font-bold">Professional Deep Valuation</h3>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">{valuation.title}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-8 rounded-full border-white/20 hover:bg-white/10 text-white" disabled={isDeepAnalyzing}>
                <Download className="h-3 w-3 mr-2" />
                Export PDF
              </Button>
              <Button variant="ghost" size="icon" className="text-white/60 hover:text-white" onClick={() => setShowDeepModal(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-auto p-8 bg-slate-50 font-serif">
            <div className="max-w-3xl mx-auto space-y-8">
              {isDeepAnalyzing && !deepResult && (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                  <Loader2 className="h-10 w-10 animate-spin mb-4" />
                  <p className="text-sm font-medium">Initiating web research and market analysis...</p>
                  <p className="text-xs mt-1">Fetching comparable auction records (Christie's, Sotheby's, etc.)</p>
                </div>
              )}

              {deepResult && (
                <div className="bg-white p-10 rounded-[2rem] shadow-xl border border-slate-200">
                  <div
                    className="prose prose-slate max-w-none 
                      prose-h1:text-4xl prose-h1:mb-8 prose-h1:font-serif
                      prose-h2:text-xs prose-h2:uppercase prose-h2:tracking-[0.4em] prose-h2:font-black prose-h2:mt-12 prose-h2:mb-4 prose-h2:text-amber-600
                      prose-h2:border-b prose-h2:border-amber-600/20 prose-h2:pb-2
                      prose-p:text-[17px] prose-p:text-slate-700 prose-p:leading-[1.8] prose-p:mb-8 prose-p:font-serif
                      prose-strong:text-slate-900 prose-strong:font-bold
                      prose-li:text-slate-700 prose-li:my-3"
                    dangerouslySetInnerHTML={{ __html: processMarkdownResponse(deepResult) }}
                  />

                  {isDeepAnalyzing && (
                    <div className="mt-8 pt-8 border-t border-slate-100 flex items-center gap-3 text-slate-400">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-xs italic">Analyzing provenance and synthesizing market data...</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
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
