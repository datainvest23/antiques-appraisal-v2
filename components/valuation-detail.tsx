import { formatDate } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Award, Download, Play, Share2, Camera, FileText, ShieldCheck, History, Loader2, Sparkles } from "lucide-react"
import Image from "next/image"
import { useState, useMemo, useRef } from "react"
import { processMarkdownResponse, extractSection } from "@/lib/markdown"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"
import { useEffect } from "react"
import { getSignedImageUrl } from "@/lib/storage-auth"

interface Valuation {
  id: string
  title: string
  summary: string
  full_description: string
  created_at: string
  is_detailed: boolean
  images: string[]
  user_comment: string
  assistant_response: string
  assistant_follow_up: string
  type?: 'standard' | 'kimi'
  extracted_data?: {
    object_name?: string
    category?: string
    stylistic_period?: string
    materials?: string
    primary_colors?: string
    inscriptions_marks?: string
    condition?: string
    historical_context?: string
  }
}

interface ValuationDetailProps {
  valuation: Valuation
}

export default function ValuationDetail({ valuation }: ValuationDetailProps) {
  const isKimi = valuation.type === 'kimi';
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const certificateRef = useRef<HTMLDivElement>(null);
  const [signedImages, setSignedImages] = useState<Record<string, string>>({});

  // Resolve signed URLs for private images
  useEffect(() => {
    const resolveImages = async () => {
      if (valuation.images && Array.isArray(valuation.images)) {
        const newSignedImages: Record<string, string> = {};
        for (const url of valuation.images) {
          if (url && url.includes('supabase.co')) {
            const signed = await getSignedImageUrl(url);
            newSignedImages[url] = signed;
          }
        }
        setSignedImages(newSignedImages);
      }
    };
    resolveImages();
  }, [valuation.images]);

  const handleDownloadReport = async () => {
    if (!certificateRef.current) return;

    setIsGeneratingPdf(true);
    try {
      const element = certificateRef.current;
      const canvas = await html2canvas(element, {
        scale: 2, // Higher quality
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });

      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Appraisal-${valuation.id.split('-')[0]}.pdf`);
    } catch (error) {
      console.error("PDF generation failed:", error);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Process markdown formatting on the fly for consistency between live and historical results
  const formattedHistoricalContext = useMemo(() => {
    if (!valuation) return '';

    // If it's already HTML (e.g. from a live API response), return it
    if (valuation.extracted_data?.historical_context?.includes('<')) {
      return valuation.extracted_data.historical_context;
    }

    // Otherwise, try to extract and process it from the raw response
    const rawContext = valuation.extracted_data?.historical_context ||
      extractSection(valuation.assistant_response, 'Historical Context') ||
      extractSection(valuation.assistant_response, 'Description');

    return rawContext ? processMarkdownResponse(rawContext) : processMarkdownResponse(valuation.assistant_response);
  }, [valuation]);

  const formattedFullResponse = useMemo(() => {
    return processMarkdownResponse(valuation.assistant_response);
  }, [valuation.assistant_response]);

  // Ensure image URLs are valid
  const mainImageUrl = useMemo(() => {
    if (!valuation.images || valuation.images.length === 0) return null;
    const originalUrl = valuation.images[0];
    return signedImages[originalUrl] || originalUrl;
  }, [valuation.images, signedImages]);

  return (
    <div className="space-y-12 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div>
          <h1 className="text-3xl font-serif font-bold text-slate-900">{valuation.title}</h1>
          <p className="text-slate-500 mt-1 flex items-center gap-2">
            <History className="h-4 w-4" />
            Authenticated on {formatDate(valuation.created_at)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-full px-6 shadow-sm">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          {!isKimi && (
            <Button variant="default" className="rounded-full px-6 shadow-md bg-amber-600 hover:bg-amber-700 text-white">
              Upgrade Apprasial
            </Button>
          )}
        </div>
      </div>

      {isKimi ? (
        <div className="animate-in fade-in slide-in-from-bottom-6 duration-1000">
          {/* Premium Assessment Certificate Layout */}
          <div
            ref={certificateRef}
            className="mx-auto w-full max-w-[1000px] bg-white shadow-2xl rounded-sm overflow-hidden border border-slate-200"
          >

            {/* 1. Header (Dark Gallery Style) */}
            <div className="bg-[#1A1A1A] p-6 md:p-10 flex flex-col md:flex-row justify-between items-center gap-6 border-b-4 border-amber-600/30">
              <div className="flex items-center gap-5">
                <div className="h-14 w-14 rounded-sm bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                  <FileText className="h-8 w-8" />
                </div>
                <div>
                  <p className="text-amber-500/80 text-[10px] uppercase tracking-[0.3em] font-bold">Antique Appraisal Platform</p>
                  <h2 className="text-white text-3xl font-serif italic mt-1 tracking-wide">Basic Valuation Report</h2>
                </div>
              </div>

              <div className="flex flex-col md:items-end gap-3 text-white/50 text-xs font-medium">
                <div className="flex flex-col md:items-end">
                  <span className="uppercase tracking-widest text-[9px] text-amber-500/60">Report Date</span>
                  <span className="text-sm font-semibold text-white/80 tabular-nums">
                    {formatDate(valuation.created_at)}
                  </span>
                </div>
                <Button
                  onClick={handleDownloadReport}
                  disabled={isGeneratingPdf}
                  className="bg-amber-600 hover:bg-amber-700 text-white rounded-none border-none px-6 py-5 uppercase text-[10px] tracking-[0.2em] font-bold h-auto shadow-lg shadow-black/20"
                >
                  {isGeneratingPdf ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                  Download PDF
                </Button>
              </div>
            </div>

            {/* 2. Main Certificate Body (Two Columns) */}
            <div className="p-8 md:p-14 grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-12 md:gap-16">

              {/* --- Left Column: Visual & ID --- */}
              <div className="space-y-12">
                {/* Image Frame */}
                <div className="relative aspect-[4/3] bg-slate-50 border-[12px] border-white shadow-xl shadow-slate-200/50 overflow-hidden group">
                  {mainImageUrl ? (
                    <div className="relative w-full h-full">
                      <Image
                        src={mainImageUrl}
                        alt="Antique Item"
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        unoptimized
                      />
                      <div className="absolute inset-0 border border-black/5 pointer-events-none" />
                    </div>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-slate-300">
                      <Camera className="h-20 w-20 opacity-20" />
                    </div>
                  )}
                </div>

                {/* Quick Identification Box */}
                <div className="relative pl-6 py-2">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-600/40 rounded-full" />
                  <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-3">Quick Identification</p>

                  <div className="space-y-6">
                    <div>
                      <span className="text-[9px] uppercase text-slate-400 font-medium block mb-1">Object Name</span>
                      <p className="text-xl font-serif font-bold text-slate-800 leading-tight">
                        {valuation.extracted_data?.object_name || valuation.title}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-6">
                      <div>
                        <span className="text-[9px] uppercase text-slate-400 font-medium block mb-1">Category</span>
                        <p className="text-sm font-serif font-semibold text-slate-800 italic">
                          {valuation.extracted_data?.category || 'General'}
                        </p>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase text-slate-400 font-medium block mb-1">Estimated Era</span>
                        <p className="text-sm font-serif font-semibold text-slate-800 italic">
                          {valuation.extracted_data?.stylistic_period || 'TBD'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* --- Right Column: Data & Narrative --- */}
              <div className="space-y-14">

                {/* Fact Sheet Section */}
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="h-px bg-amber-600/20 flex-grow" />
                    <h3 className="text-[11px] uppercase tracking-[0.4em] font-black text-slate-800">Fact Sheet</h3>
                  </div>

                  <div className="border border-slate-100 rounded-sm overflow-hidden">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-100">
                          <th className="p-4 uppercase tracking-widest text-[9px] text-slate-400 font-bold border-r border-slate-100">Feature</th>
                          <th className="p-4 uppercase tracking-widest text-[9px] text-slate-400 font-bold">Details</th>
                        </tr>
                      </thead>
                      <tbody className="font-serif">
                        <tr className="border-b border-slate-50">
                          <td className="p-4 font-bold text-slate-900 border-r border-slate-50 bg-slate-50/30">Material</td>
                          <td className="p-4 text-slate-600">{valuation.extracted_data?.materials || "Verified"}</td>
                        </tr>
                        <tr className="border-b border-slate-50">
                          <td className="p-4 font-bold text-slate-900 border-r border-slate-50 bg-slate-50/30">Primary Colors</td>
                          <td className="p-4 text-slate-600">{valuation.extracted_data?.primary_colors || "Verified"}</td>
                        </tr>
                        <tr className="border-b border-slate-50">
                          <td className="p-4 font-bold text-slate-900 border-r border-slate-50 bg-slate-50/30">Markings</td>
                          <td className="p-4 text-slate-600">{valuation.extracted_data?.inscriptions_marks || "None detected"}</td>
                        </tr>
                        <tr>
                          <td className="p-4 font-bold text-slate-900 border-r border-slate-50 bg-slate-50/30">Condition</td>
                          <td className="p-4">
                            <span className="bg-amber-100/50 text-amber-800 px-2 py-0.5 rounded-full text-[10px] font-bold border border-amber-200/50">
                              {valuation.extracted_data?.condition || "Verified"}
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Historical Narrative Section */}
                <div className="space-y-8">
                  <div className="flex items-center gap-4">
                    <div className="h-px bg-amber-600/20 flex-grow" />
                    <h3 className="text-[11px] uppercase tracking-[0.4em] font-black text-slate-800">Historical Context & Description</h3>
                  </div>

                  <div
                    className="text-slate-700 leading-loose prose prose-slate prose-lg max-w-none font-serif
                                prose-p:text-base prose-p:text-slate-600 prose-p:mb-6
                                prose-strong:text-slate-900 prose-strong:font-bold"
                    dangerouslySetInnerHTML={{ __html: formattedHistoricalContext }}
                  />
                </div>
              </div>
            </div>

            {/* 3. Footer Assessment Ref */}
            <div className="bg-slate-50/80 border-t border-slate-100 p-8 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
                Report Reference: {valuation.id.split('-')[0]?.toUpperCase()}-CERT
              </div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-slate-300 font-medium">
                © {new Date().getFullYear()} Antique Appraisal Platform. All rights reserved.
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="flex gap-2">
            <Badge className="bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100 px-3 py-1 font-medium">
              <Award className="h-3.5 w-3.5 mr-1.5" />
              Detailed Valuation
            </Badge>
            <div className="ml-auto flex items-center gap-2">
              <div className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="h-3 w-3" />
                Verified Report
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mt-4" ref={certificateRef}>
            <Card className="rounded-3xl border-slate-200/60 shadow-lg shadow-slate-200/30 overflow-hidden group">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5 text-primary/70" />
                  Reference Images
                </CardTitle>
                <CardDescription>Visual evidence for this appraisal</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {valuation.images && valuation.images.length > 0 ? (
                    valuation.images.map((image, index) => (
                      <div key={index} className="relative aspect-square overflow-hidden rounded-2xl group cursor-zoom-in">
                        <Image
                          src={signedImages[image] || image}
                          alt={`Antique item ${index + 1}`}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                          crossOrigin="anonymous"
                          unoptimized
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                      </div>
                    ))
                  ) : (
                    <div className="col-span-2 py-12 text-center text-muted-foreground border-2 border-dashed border-slate-100 rounded-3xl">
                      No images available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-slate-200/60 shadow-lg shadow-slate-200/30 group">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary/70" />
                  Appraisal Summary
                </CardTitle>
                <CardDescription>High-level overview of the professional assessment</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-lg text-slate-700 leading-relaxed font-serif">
                  {valuation.summary}
                </p>

                <div className="pt-4 border-t border-slate-100">
                  <Button variant="outline" size="sm" className="rounded-full shadow-sm hover:shadow transition-all group">
                    <Play className="h-4 w-4 mr-2 text-primary" />
                    Play Audio Summary
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="analysis" className="w-full mt-12">
            <TabsList className="grid w-full grid-cols-2 p-1.5 bg-slate-100/50 rounded-2xl border border-slate-200/50 h-auto">
              <TabsTrigger value="analysis" className="rounded-xl py-3 data-[state=active]:shadow-md">
                Full Analysis
              </TabsTrigger>
              <TabsTrigger value="feedback" className="rounded-xl py-3 data-[state=active]:shadow-md">
                Your Comments
              </TabsTrigger>
            </TabsList>

            <TabsContent value="analysis" className="space-y-4 pt-6">
              <div className="relative group max-w-4xl mx-auto">
                <div className="absolute -inset-1 bg-gradient-to-b from-primary/5 to-transparent rounded-[3rem] blur-xl opacity-50"></div>
                <div className="relative bg-white border border-slate-200/80 p-8 md:p-12 rounded-[2.5rem] shadow-xl overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none">
                    <ShieldCheck className="h-64 w-64 rotate-12" />
                  </div>

                  <div
                    className="prose prose-slate max-w-none 
                              prose-headings:font-serif prose-headings:font-bold
                              prose-h1:text-3xl prose-h1:text-primary prose-h1:mb-8 prose-h1:text-center
                              prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-6 prose-h2:text-slate-800 prose-h2:flex prose-h2:items-center prose-h2:gap-3
                              prose-h2:before:content-[''] prose-h2:before:inline-block prose-h2:before:w-1 prose-h2:before:h-8 prose-h2:before:bg-primary/30 prose-h2:before:rounded-full
                              prose-p:text-lg prose-p:text-slate-600 prose-p:leading-relaxed
                              prose-strong:text-slate-900 prose-strong:font-bold
                              prose-li:text-slate-600 prose-li:my-2
                              prose-table:text-sm prose-table:rounded-2xl prose-table:overflow-hidden prose-table:border-hidden prose-table:shadow-md prose-table:my-10
                              prose-thead:bg-slate-900/5 prose-thead:border-b-2 prose-thead:border-slate-200 prose-th:p-5 prose-th:text-slate-900 prose-th:uppercase prose-th:tracking-wider
                              prose-td:p-5 prose-td:border-b prose-td:border-slate-100
                              hover:prose-tr:bg-slate-50/80 transition-colors duration-200"
                    dangerouslySetInnerHTML={{ __html: formattedFullResponse }}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="feedback" className="space-y-4 pt-6">
              <Card className="rounded-[2rem] border-slate-200 px-8 py-4 shadow-lg shadow-slate-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History className="h-5 w-5 text-slate-400" />
                    Intake Feedback
                  </CardTitle>
                  <CardDescription>Contextual information provided for this assessment</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-slate-50/80 p-6 rounded-2xl border border-slate-100">
                    <p className="text-slate-700 italic">"{valuation.user_comment || "No comments provided."}"</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}
