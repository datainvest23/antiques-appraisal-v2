import React from "react";
import type { AntiqueAnalysisResult } from "@/lib/openai";
import { Button } from "@/components/ui/button";
import { Printer, Download } from "lucide-react";
import Image from "next/image";

interface DetailedAnalysisProps {
  analysis: AntiqueAnalysisResult | null;
  imageUrls?: string[];
}

export default function DetailedAnalysis({ analysis, imageUrls = [] }: DetailedAnalysisProps) {
  // Safety check - if analysis is null/undefined, return a placeholder
  if (!analysis) {
    return (
      <div className="p-4 text-center">
        <p>No analysis data available.</p>
      </div>
    );
  }

  // Function to handle printing
  const handlePrint = () => {
    window.print();
  };

  // Extract title and clean it up if needed
  const itemTitle = extractTitle(analysis) || analysis.introduction?.title || analysis.preliminaryCategory || "Antique Item";
  const era = analysis.stylistic?.estimatedEra || "Unknown era";

  return (
    <div className="w-full bg-white animate-fade-in print:animate-none">
      {/* Header with title and print button */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 print:mb-4">
        <div className="text-center md:text-left">
          <h1 className="text-3xl font-serif font-bold text-slate-800 mb-2">{itemTitle}</h1>
          <p className="text-slate-600 text-lg italic">{era}</p>
        </div>
        <div className="mt-4 md:mt-0 print:hidden">
          <Button
            onClick={handlePrint}
            className="flex items-center gap-2"
            variant="outline"
          >
            <Printer size={16} />
            <span>Print Report</span>
          </Button>
        </div>
      </div>

      {/* Full formatted content display */}
      {analysis.content ? (
        // If there's formatted content from the API, display it directly 
        <div className="prose prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: analysis.content }} />
      ) : (
        // Fallback to simple display
      <div className="flex flex-col lg:flex-row gap-8">
          {/* Left column with summary and details */}
          <div className="lg:w-2/3 space-y-6">
            {/* Summary section */}
            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
              <div className="p-4 border-b border-slate-200">
                <h2 className="font-medium text-slate-900">Summary</h2>
              </div>
              <div className="p-6">
                <p className="text-slate-700">{analysis.summary}</p>
              </div>
            </div>
            
            {/* Full report section */}
            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
              <div className="p-4 border-b border-slate-200">
                <h2 className="font-medium text-slate-900">Analysis Report</h2>
              </div>
              <div className="p-6 prose prose-slate">
                <div dangerouslySetInnerHTML={{ __html: typeof analysis.fullReport === 'string' 
                  ? analysis.fullReport.replace(/\n/g, '<br />') 
                  : JSON.stringify(analysis.fullReport, null, 2) }} />
              </div>
            </div>
          </div>
          
          {/* Right sidebar with image gallery and key details */}
          <div className="lg:w-1/3 space-y-6">
            {/* Image gallery */}
            {imageUrls && imageUrls.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
                <div className="p-4 border-b border-slate-200">
                  <h2 className="font-medium text-slate-900">Item Gallery</h2>
              </div>
              <div className="grid grid-cols-2 gap-2 p-4">
                {imageUrls.slice(0, 4).map((url, index) => (
                  <div key={index} className="relative aspect-square rounded overflow-hidden">
                    <Image
                      src={url}
                      alt={`${itemTitle} - view ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Key details card */}
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-200">
              <h2 className="font-medium text-slate-900">Key Details</h2>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Category</h3>
                  <p className="mt-1 text-slate-900">{analysis.preliminaryCategory || "Antique Item"}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Material</h3>
                <p className="mt-1 text-slate-900">{analysis.physicalAttributes?.materials || "Not specified"}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Condition</h3>
                <p className="mt-1 text-slate-900">{analysis.physicalAttributes?.condition || "Not specified"}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Value Factors</h3>
                <p className="mt-1 text-slate-900">{analysis.valueIndicators?.factors || "Not specified"}</p>
              </div>
            </div>
          </div>
          </div>
        </div>
      )}
    </div>
  );
}

function extractTitle(analysis: AntiqueAnalysisResult): string | null {
  if (analysis.introduction?.title) return analysis.introduction.title;
  if (analysis.preliminaryCategory) return analysis.preliminaryCategory;
  return null;
}