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
import { useAuth } from "@/contexts/auth-context"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

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
  const { user } = useAuth()
  const supabase = createClientComponentClient()
  const [displayUrl, setDisplayUrl] = useState<string | null>(null)
  const [resolvedImageUrls, setResolvedImageUrls] = useState<string[]>([])
  const [loadingPhase, setLoadingPhase] = useState<LoadingPhase>('idle')
  const [deepReport, setDeepReport] = useState<Record<string, any> | null>(null)
  const [showDeepModal, setShowDeepModal] = useState(false)
  const isDeepAnalyzing = loadingPhase !== 'idle' && loadingPhase !== 'done'
  const hasSavedReport = deepReport !== null && loadingPhase === 'idle'

  // Load existing deep report from Supabase if it exists
  useEffect(() => {
    const loadSavedReport = async () => {
      if (!user) return
      try {
        const { data } = await supabase
          .from('deep_valuations')
          .select('report_json')
          .eq('valuation_id', valuation.id)
          .single()
        if (data?.report_json) {
          setDeepReport(data.report_json)
        }
      } catch {
        // No saved report — that's fine
      }
    }
    loadSavedReport()
  }, [valuation.id, user])

  useEffect(() => {
    const resolveImage = async () => {
      // Resolve primary thumbnail
      if (valuation.image_url) {
        if (valuation.image_url.includes('supabase.co')) {
          const signed = await getSignedImageUrl(valuation.image_url)
          setDisplayUrl(signed)
        } else {
          setDisplayUrl(valuation.image_url)
        }
      }
      // Resolve all images for use in the report
      const allUrls = valuation.image_urls?.length
        ? valuation.image_urls
        : valuation.image_url ? [valuation.image_url] : []
      const resolved = await Promise.all(
        allUrls.map(async (url) =>
          url.includes('supabase.co') ? await getSignedImageUrl(url) : url
        )
      )
      setResolvedImageUrls(resolved.filter(Boolean) as string[])
    }
    resolveImage()
  }, [valuation.image_url, valuation.image_urls])

  const handleDeepValuation = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    // If a saved report already exists, just open the modal
    if (hasSavedReport) {
      setShowDeepModal(true)
      return
    }

    try {
      setLoadingPhase('images')
      setDeepReport(null)
      setShowDeepModal(true)

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
          imageUrls: resolvedImageUrls,
          valuationId: valuation.id,
          userId: user?.id,
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
      // Don't close the modal, let the user see the error state
      setDeepReport({ error: error.message })
    }
  }

  const handleExportPDF = async () => {
    if (!deepReport) return
    const printWindow = window.open('', '_blank')
    if (!printWindow) return
    const imagesHtml = resolvedImageUrls.length
      ? `<div style="display:flex;gap:12px;flex-wrap:wrap;margin:1.5em 0">
          ${resolvedImageUrls.map(url =>
        `<img src="${url}" style="max-height:220px;max-width:280px;object-fit:cover;border-radius:6px;border:1px solid #e2e8f0" />`
      ).join('')}
        </div>`
      : ''
    const html = `<!DOCTYPE html><html><head><title>${deepReport.title || 'Valuation Report'}</title>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,400;0,700;1,400&display=swap');
      body { font-family: 'Crimson Pro', Georgia, serif; max-width: 850px; margin: 0 auto; padding: 60px 40px; color: #1a1a1a; line-height: 1.8; background: #fff; }
      .header { border-bottom: 2px solid #92400e; padding-bottom: 20px; margin-bottom: 40px; text-align: center; }
      h1 { font-size: 2.8em; margin: 0; color: #1a1a1a; font-weight: 700; letter-spacing: -0.02em; }
      .meta { display: flex; justify-content: center; gap: 30px; margin-top: 15px; font-size: 0.9em; color: #64748b; text-transform: uppercase; letter-spacing: 0.1em; }
      .value-banner { background: #fefce8; border: 1px solid #fde047; padding: 30px; margin: 40px 0; border-radius: 8px; display: flex; justify-content: space-around; align-items: center; }
      .value-item { text-align: center; }
      .value-label { font-[10px]; uppercase; tracking-widest; color: #92400e; font-weight: 700; margin-bottom: 5px; display: block; }
      .value-price { font-size: 2em; font-weight: 700; color: #1a1a1a; }
      .section-title { font-size: 0.85em; text-transform: uppercase; letter-spacing: 0.4em; color: #92400e; margin-top: 3em; border-bottom: 1px solid #fef08a; padding-bottom: 5px; font-weight: 700; }
      h3 { font-size: 1.5em; margin-top: 1.5em; color: #1a1a1a; }
      .content { margin-bottom: 2em; }
      table { width: 100%; border-collapse: collapse; margin: 2em 0; background: #fff; }
      th, td { padding: 12px; border: 1px solid #e2e8f0; text-align: left; }
      th { background: #f8fafc; font-size: 0.7em; text-transform: uppercase; letter-spacing: 0.1em; color: #64748b; }
      .footer { margin-top: 60px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 0.75em; color: #94a3b8; display: flex; justify-content: space-between; }
      @media print { 
        body { padding: 0; }
        .value-banner { break-inside: avoid; background: #fefce8 !important; -webkit-print-color-adjust: exact; }
        .section-title { break-after: avoid; }
        img { max-height: 250px; page-break-inside: avoid; }
      }
    </style></head>
    <body>
      <div class="header">
        <h1>Professional Valuation Report</h1>
        <div class="meta">
          <span>Date: ${deepReport.valuation_date}</span>
          <span>Currency: ${deepReport.currency}</span>
          <span>Confidence: ${deepReport.confidence_level}</span>
        </div>
      </div>

      <div class="value-banner">
        <div class="value-item">
          <span class="value-label">Estimated Value Range</span>
          <span class="value-price">${deepReport.currency} ${deepReport.estimated_value_low?.toLocaleString()} – ${deepReport.estimated_value_high?.toLocaleString()}</span>
        </div>
      </div>

      ${imagesHtml}

      ${Object.entries(deepReport.sections || {}).map(([key, sec]: [string, any]) =>
      `<div class="section-title">${key.replace(/_/g, ' ')}</div>
         <div class="content">${processMarkdownResponse(sec.content || '')}</div>`
    ).join('')}

      <div class="footer">
        <span>Powered by Antique Valuation Intelligence Pipeline</span>
        <span>© ${new Date().getFullYear()} Professional Appraisal Services</span>
      </div>
    </body></html>`
    printWindow.document.write(html)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => {
      printWindow.print()
    }, 500)
  }

  const s = deepReport?.sections

  return (
    <>
      <div className="block h-full group">
        <Card className="h-full overflow-hidden border-slate-200/60 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group relative">
          <Link href={`/my-valuations/${valuation.id}`} className="block flex-grow">
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

              {/* Status Badge Overlays */}
              <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                {valuation.is_detailed ? (
                  <Badge className="bg-slate-900/80 text-white border-none backdrop-blur-md text-[9px] uppercase tracking-wider h-5 px-2">
                    <Award className="h-2.5 w-2.5 mr-1" />Premium Appraisal
                  </Badge>
                ) : (
                  <Badge className="bg-slate-700/60 text-white border-none backdrop-blur-md text-[9px] uppercase tracking-wider h-5 px-2">
                    Standard
                  </Badge>
                )}
              </div>
            </div>

            <CardHeader className="p-5 pb-0">
              <div className="flex flex-col gap-1">
                <CardTitle className="text-xl font-serif font-bold text-slate-800 line-clamp-1 group-hover:text-amber-700 transition-colors">
                  {valuation.title}
                </CardTitle>

                <div className="flex items-center flex-wrap gap-x-3 gap-y-1.5 mt-1">
                  <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                    <Clock className="h-3 w-3 text-slate-300" />
                    {formatDistanceToNow(new Date(valuation.created_at), { addSuffix: true })}
                  </div>

                  {valuation.era && (
                    <Badge variant="outline" className="h-5 px-2 border-slate-200 text-slate-500 font-medium text-[9px] uppercase tracking-wider bg-slate-50/50">
                      {valuation.era}
                    </Badge>
                  )}

                  {valuation.category && (
                    <Badge variant="outline" className="h-5 px-2 border-amber-100 text-amber-700 font-semibold text-[9px] uppercase tracking-wider bg-amber-50/30">
                      <Tag className="h-2.5 w-2.5 mr-1 text-amber-400" />
                      {valuation.category}
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="px-5 py-4">
              <p className="text-[13px] text-slate-500 line-clamp-2 leading-relaxed italic border-l-2 border-slate-100 pl-3 mb-4">
                {valuation.summary}
              </p>

              {hasSavedReport && deepReport.estimated_value_low ? (
                <div className="bg-emerald-50/50 border border-emerald-100/50 rounded-lg p-3 flex items-center justify-between group/price hover:bg-emerald-50 transition-colors">
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-emerald-600 mb-0.5">Est. Price Range</span>
                    <span className="text-base font-serif font-bold text-slate-900 leading-none">
                      {deepReport.currency} {deepReport.estimated_value_low?.toLocaleString()} – {deepReport.estimated_value_high?.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-white border border-emerald-100 flex items-center justify-center shadow-sm text-emerald-600">
                    <Sparkles className="h-5 w-5" />
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Link>

          <CardFooter className="px-5 py-4 border-t border-slate-50 gap-3 bg-slate-50/20">
            <Button
              size="sm"
              variant={hasSavedReport ? "outline" : "default"}
              disabled={isDeepAnalyzing}
              onClick={handleDeepValuation}
              className={`flex-1 h-10 rounded-none text-[10px] uppercase font-black tracking-[0.2em] transition-all shadow-sm ${hasSavedReport
                  ? "border-slate-200 text-slate-600 bg-white hover:bg-amber-50 hover:border-amber-200 hover:text-amber-700"
                  : "bg-amber-600 hover:bg-amber-700 text-white shadow-amber-200"
                }`}
            >
              {isDeepAnalyzing
                ? <Loader2 className="h-3 w-3 animate-spin mr-2" />
                : hasSavedReport
                  ? <FileCheck className="h-3.5 w-3.5 mr-2 text-emerald-500" />
                  : <Sparkles className="h-3.5 w-3.5 mr-2 text-amber-200" />}
              {hasSavedReport ? 'Re-Review Deep Report' : 'Run Deep Valuation'}
            </Button>

            <Link href={`/my-valuations/${valuation.id}`} className="h-10 w-10 flex items-center justify-center border border-slate-100 bg-white hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer group/details" title={t('btn_view_details')}>
              <ChevronRight className="h-5 w-5 transform group-hover/details:translate-x-0.5 transition-transform" />
            </Link>
          </CardFooter>
        </Card>
      </div>

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
            {/* ── ERROR STATE ── */}
            {deepReport?.error && !isDeepAnalyzing && (
              <div className="flex flex-col items-center justify-center h-full min-h-[400px] p-10 text-center">
                <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
                  <X className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-xl font-serif font-bold text-slate-900 mb-2">Analysis Could Not Be Completed</h3>
                <p className="text-slate-500 max-w-sm mb-8">
                  {deepReport.error || "An unexpected error occurred during the deep valuation process."}
                </p>
                <Button
                  onClick={(e) => handleDeepValuation(e as any)}
                  className="bg-amber-600 hover:bg-amber-700 rounded-full px-8"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              </div>
            )}

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
                {/* Item Images */}
                {resolvedImageUrls.length > 0 && (
                  <div className="mb-8">
                    <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-3">Item Images</p>
                    <div className="flex gap-3 flex-wrap">
                      {resolvedImageUrls.map((url, i) => (
                        <div key={i} className="relative h-40 w-56 rounded-xl overflow-hidden border border-slate-200 shadow-sm flex-shrink-0">
                          <Image src={url} alt={`Item image ${i + 1}`} fill className="object-cover" unoptimized />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

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
        <Link href="/appraise-v2">
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
        <Link href="/appraise-v2">
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
