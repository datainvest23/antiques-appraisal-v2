"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { formatDistanceToNow } from "date-fns"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Award, ChevronRight, Camera, Tag, Clock, Sparkles, Loader2, X, Download, ExternalLink, CheckCircle2, Search, Brain, FileCheck } from "lucide-react"
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

type LoadingPhase = 'idle' | 'images' | 'research' | 'formatting' | 'done'

const LOADING_MESSAGES: Record<LoadingPhase, { title: string; sub: string }> = {
  idle: { title: '', sub: '' },
  images: { title: 'Preparing Images', sub: 'Encoding high-resolution photos for AI analysis...' },
  research: { title: 'Deep Market Research', sub: 'Querying Christie\'s, Sotheby\'s, Bonhams & global auction records...' },
  formatting: { title: 'Structuring Report', sub: 'Compiling 15-section professional valuation document...' },
  done: { title: 'Report Ready', sub: '' },
}

function SectionBlock({ title, content, extra }: { title: string; content?: string; extra?: React.ReactNode }) {
  if (!content && !extra) return null
  return (
    <div className="mb-10">
      <h2 className="text-[10px] uppercase tracking-[0.4em] font-black text-amber-600 mb-3 pb-2 border-b border-amber-600/20">
        {title}
      </h2>
      {content && (
        <div
          className="prose prose-slate max-w-none prose-p:text-[16px] prose-p:leading-[1.8] prose-p:font-serif prose-li:text-slate-700 prose-li:my-2 prose-strong:text-slate-900"
          dangerouslySetInnerHTML={{ __html: processMarkdownResponse(content) }}
        />
      )}
      {extra}
    </div>
  )
}

function ComparableTable({ sales }: { sales: Array<{ title: string; auction_house: string; date: string; price: number; currency: string; url: string | null }> }) {
  if (!sales?.length) return null
  return (
    <div className="overflow-x-auto mt-4">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-slate-100">
            {['Item', 'Auction House', 'Date', 'Price', ''].map(h => (
              <th key={h} className="text-left px-3 py-2 text-[10px] uppercase tracking-wider text-slate-500 font-bold whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sales.map((s, i) => (
            <tr key={i} className="border-t border-slate-100 hover:bg-slate-50">
              <td className="px-3 py-2 font-medium text-slate-800 font-serif">{s.title}</td>
              <td className="px-3 py-2 text-slate-600">{s.auction_house}</td>
              <td className="px-3 py-2 text-slate-500 whitespace-nowrap">{s.date}</td>
              <td className="px-3 py-2 font-bold text-emerald-700 whitespace-nowrap">{s.currency} {s.price?.toLocaleString()}</td>
              <td className="px-3 py-2">
                {s.url ? (
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-amber-600 hover:text-amber-800 text-xs">
                    <ExternalLink className="h-3 w-3" />Source
                  </a>
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ValuationCard({ valuation }: { valuation: Valuation }) {
  const { t } = useLanguage()
  const { toast } = useToast()
  const [displayUrl, setDisplayUrl] = useState<string | null>(null)
  const [loadingPhase, setLoadingPhase] = useState<LoadingPhase>('idle')
  const [deepReport, setDeepReport] = useState<Record<string, any> | null>(null)
  const [showDeepModal, setShowDeepModal] = useState(false)
  const isDeepAnalyzing = loadingPhase !== 'idle' && loadingPhase !== 'done'

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
      setLoadingPhase('images')
      setDeepReport(null)
      setShowDeepModal(true)

      // Resolve signed URLs
      const imagesToProcess = valuation.image_urls || (valuation.image_url ? [valuation.image_url] : [])
      const resolvedUrls = await Promise.all(
        imagesToProcess.map(async (url) => {
          if (url.includes('supabase.co')) return await getSignedImageUrl(url)
          return url
        })
      )

      setLoadingPhase('research')

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
          imageUrls: resolvedUrls,
          valuationId: valuation.id
        })
      })

      setLoadingPhase('formatting')

      if (!response.ok) throw new Error('Deep analysis failed')

      const json = await response.json()
      if (json.error) throw new Error(json.error)

      setDeepReport(json)
      setLoadingPhase('done')

    } catch (error: any) {
      console.error('Deep Analysis Error:', error)
      toast({
        title: "Analysis Failed",
        description: error.message,
        variant: "destructive"
      })
      setLoadingPhase('idle')
      setShowDeepModal(false)
    }
  }

  const handleExportPDF = async () => {
    if (!deepReport) return
    // Simple print-to-PDF approach
    const printWindow = window.open('', '_blank')
    if (!printWindow) return
    const html = `<!DOCTYPE html><html><head><title>${deepReport.title || 'Valuation Report'}</title>
    <style>body{font-family:Georgia,serif;max-width:800px;margin:40px auto;color:#1a1a1a;line-height:1.8;}
    h1{font-size:2em;margin-bottom:0.5em;}h2{font-size:0.8em;text-transform:uppercase;letter-spacing:0.3em;color:#92400e;margin-top:2em;border-bottom:1px solid #fcd34d;padding-bottom:0.3em;}
    table{width:100%;border-collapse:collapse;margin:1em 0;}td,th{padding:8px;border:1px solid #e2e8f0;text-align:left;}
    th{background:#f8fafc;font-size:0.75em;text-transform:uppercase;}</style></head>
    <body><h1>${deepReport.title || 'Professional Valuation Report'}</h1>
    <p><strong>Date:</strong> ${deepReport.valuation_date} &nbsp; <strong>Currency:</strong> ${deepReport.currency} &nbsp; <strong>Confidence:</strong> ${deepReport.confidence_level}</p>
    <p><strong>Estimated Value:</strong> ${deepReport.currency} ${deepReport.estimated_value_low?.toLocaleString()} – ${deepReport.estimated_value_high?.toLocaleString()}</p>
    ${Object.entries(deepReport.sections || {}).map(([key, sec]: [string, any]) =>
      `<h2>${key.replace(/_/g, ' ')}</h2><div>${processMarkdownResponse(sec.content || '')}</div>`
    ).join('')}
    </body></html>`
    printWindow.document.write(html)
    printWindow.document.close()
    printWindow.print()
  }

  const s = deepReport?.sections

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

      <Dialog open={showDeepModal} onOpenChange={(open) => {
        if (!isDeepAnalyzing) setShowDeepModal(open)
      }}>
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0 overflow-hidden border-white/10 shadow-2xl">
          <div className="sr-only">
            <DialogTitle>Deep Valuation Report</DialogTitle>
            <DialogDescription>A comprehensive AI-powered appraisal report with historical context and market analysis.</DialogDescription>
          </div>

          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b bg-slate-900 text-white flex-shrink-0">
            <div className="flex items-center gap-3">
              <Sparkles className="h-6 w-6 text-amber-400" />
              <div>
                <h3 className="text-lg font-serif font-bold">Professional Deep Valuation</h3>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">{valuation.title}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {deepReport && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 rounded-full border-white/20 hover:bg-white/10 text-white"
                  onClick={handleExportPDF}
                >
                  <Download className="h-3 w-3 mr-2" />
                  Export PDF
                </Button>
              )}
              {!isDeepAnalyzing && (
                <Button variant="ghost" size="icon" className="text-white/60 hover:text-white" onClick={() => setShowDeepModal(false)}>
                  <X className="h-5 w-5" />
                </Button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-auto bg-slate-50">
            {/* ── LOADING STATE ── */}
            {isDeepAnalyzing && (
              <div className="flex flex-col items-center justify-center h-full min-h-[400px] p-10">
                {/* Animated orbital loader */}
                <div className="relative mb-8">
                  <div className="h-20 w-20 rounded-full border-2 border-amber-200 animate-ping absolute inset-0" />
                  <div className="h-20 w-20 rounded-full border-2 border-amber-400/50 animate-spin" style={{ animationDuration: '3s' }} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    {loadingPhase === 'images' && <Camera className="h-8 w-8 text-amber-500" />}
                    {loadingPhase === 'research' && <Search className="h-8 w-8 text-amber-500 animate-pulse" />}
                    {loadingPhase === 'formatting' && <Brain className="h-8 w-8 text-amber-500 animate-pulse" />}
                  </div>
                </div>

                <h3 className="text-2xl font-serif font-bold text-slate-800 mb-2">
                  {LOADING_MESSAGES[loadingPhase].title}
                </h3>
                <p className="text-slate-500 text-sm text-center max-w-xs">
                  {LOADING_MESSAGES[loadingPhase].sub}
                </p>

                {/* Phase progress */}
                <div className="mt-8 flex flex-col gap-2 w-full max-w-xs">
                  {(['images', 'research', 'formatting'] as LoadingPhase[]).map((phase) => {
                    const phases: LoadingPhase[] = ['images', 'research', 'formatting']
                    const currentIdx = phases.indexOf(loadingPhase)
                    const phaseIdx = phases.indexOf(phase)
                    const isDone = phaseIdx < currentIdx
                    const isCurrent = phaseIdx === currentIdx
                    return (
                      <div key={phase} className="flex items-center gap-3">
                        <div className={`h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0 ${isDone ? 'bg-emerald-100' : isCurrent ? 'bg-amber-100' : 'bg-slate-100'}`}>
                          {isDone ? <CheckCircle2 className="h-3 w-3 text-emerald-600" /> : isCurrent ? <Loader2 className="h-3 w-3 text-amber-600 animate-spin" /> : <div className="h-2 w-2 rounded-full bg-slate-300" />}
                        </div>
                        <span className={`text-xs font-medium ${isDone ? 'text-emerald-700' : isCurrent ? 'text-amber-700' : 'text-slate-400'}`}>
                          {LOADING_MESSAGES[phase].title}
                        </span>
                      </div>
                    )
                  })}
                </div>

                <p className="mt-6 text-[11px] text-slate-400 italic">
                  Typical processing time: 30–90 seconds
                </p>
              </div>
            )}

            {/* ── REPORT STATE ── */}
            {!isDeepAnalyzing && deepReport && (
              <div className="p-8">
                {/* Value Banner */}
                {deepReport.estimated_value_low && (
                  <div className="mb-8 bg-gradient-to-r from-amber-50 to-amber-100/50 border border-amber-200 rounded-2xl p-6 flex flex-wrap gap-6 items-center">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-amber-600 font-bold mb-1">Estimated Value Range</p>
                      <p className="text-3xl font-serif font-bold text-slate-900">
                        {deepReport.currency} {deepReport.estimated_value_low?.toLocaleString()} – {deepReport.estimated_value_high?.toLocaleString()}
                      </p>
                    </div>
                    <div className="border-l border-amber-200 pl-6">
                      <p className="text-[10px] uppercase tracking-widest text-amber-600 font-bold mb-1">Point Estimate</p>
                      <p className="text-xl font-serif font-bold text-slate-700">{deepReport.currency} {deepReport.estimated_value_point?.toLocaleString()}</p>
                    </div>
                    <div className="border-l border-amber-200 pl-6">
                      <p className="text-[10px] uppercase tracking-widest text-amber-600 font-bold mb-1">Confidence</p>
                      <Badge className={`${deepReport.confidence_level === 'High' ? 'bg-emerald-100 text-emerald-800' : deepReport.confidence_level === 'Medium' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'} border-none`}>
                        {deepReport.confidence_level}
                      </Badge>
                    </div>
                  </div>
                )}

                <div className="bg-white p-10 rounded-[2rem] shadow-xl border border-slate-200 max-w-3xl mx-auto">
                  {s?.executive_summary && <SectionBlock title="1. Executive Summary" content={s.executive_summary.content} />}
                  {s?.purpose_of_valuation && <SectionBlock title="2. Purpose of Valuation" content={s.purpose_of_valuation.content} />}
                  {s?.object_identification && <SectionBlock title="3. Object Identification & Description" content={s.object_identification.content} />}
                  {s?.attribution_analysis && <SectionBlock title="4. Attribution Analysis" content={s.attribution_analysis.content} />}
                  {s?.condition_report && (
                    <SectionBlock
                      title="5. Condition Report"
                      content={s.condition_report.content}
                      extra={s.condition_report.overall ? (
                        <div className="mt-2">
                          <Badge className="bg-slate-100 text-slate-700 border-slate-200">Overall: {s.condition_report.overall}</Badge>
                        </div>
                      ) : undefined}
                    />
                  )}
                  {s?.provenance_analysis && <SectionBlock title="6. Provenance Analysis" content={s.provenance_analysis.content} />}
                  {s?.market_analysis && (
                    <SectionBlock
                      title="7. Market Analysis — Comparable Sales"
                      content={s.market_analysis.content}
                      extra={<ComparableTable sales={s.market_analysis.comparable_sales} />}
                    />
                  )}
                  {s?.valuation_methodology && <SectionBlock title="8. Valuation Methodology" content={s.valuation_methodology.content} />}
                  {s?.valuation_conclusion && <SectionBlock title="9. Valuation Conclusion" content={s.valuation_conclusion.content} />}
                  {s?.risk_analysis && <SectionBlock title="10. Risk & Uncertainty Analysis" content={s.risk_analysis.content} />}
                  {s?.authenticity_assessment && <SectionBlock title="11. Authenticity Assessment" content={s.authenticity_assessment.content} />}
                  {s?.sale_channel_analysis && <SectionBlock title="12. Sale Channel Analysis" content={s.sale_channel_analysis.content} />}
                  {s?.liquidity_assessment && <SectionBlock title="13. Liquidity Assessment" content={s.liquidity_assessment.content} />}
                  {s?.certification && <SectionBlock title="14. Professional Certification" content={s.certification.content} />}
                  {s?.forensic_image_analysis && <SectionBlock title="15. Forensic Image Analysis" content={s.forensic_image_analysis.content} />}

                  {/* Fallback for unstructured response */}
                  {deepReport.raw_report && !s && (
                    <div
                      className="prose prose-slate max-w-none"
                      dangerouslySetInnerHTML={{ __html: processMarkdownResponse(deepReport.raw_report) }}
                    />
                  )}

                  {/* Footer */}
                  <div className="mt-10 pt-6 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                    <div className="flex items-center gap-2">
                      <FileCheck className="h-3 w-3" />
                      <span>Powered by Perplexity Sonar Reasoning Pro + Gemini Flash</span>
                    </div>
                    <span>{deepReport.valuation_date}</span>
                  </div>
                </div>
              </div>
            )}
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
