import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { AntiqueAnalysisResult } from "@/lib/openai"

interface DetailedAnalysisProps {
  analysis: AntiqueAnalysisResult | null;
}

export default function DetailedAnalysis({ analysis }: DetailedAnalysisProps) {
  // Safety check - if analysis is null/undefined, return a placeholder
  if (!analysis) {
    return (
      <div className="p-4 text-center">
        <p>No analysis data available.</p>
      </div>
    );
  }

  // Safely access nested properties
  const getNestedProperty = (obj: any, path: string, fallback: string = "Not available") => {
    try {
      return path.split('.').reduce((prev, curr) => {
        return prev && prev[curr] !== undefined ? prev[curr] : fallback;
      }, obj) || fallback;
    } catch {
      return fallback;
    }
  };

  // Ensure each section has data with fallbacks
  const materials = getNestedProperty(analysis, 'physicalAttributes.materials');
  const measurements = getNestedProperty(analysis, 'physicalAttributes.measurements');
  const condition = getNestedProperty(analysis, 'physicalAttributes.condition');
  
  const signatures = getNestedProperty(analysis, 'inscriptions.signatures');
  const hallmarks = getNestedProperty(analysis, 'inscriptions.hallmarks');
  const additionalIdentifiers = getNestedProperty(analysis, 'inscriptions.additionalIdentifiers');
  
  const motifs = getNestedProperty(analysis, 'uniqueFeatures.motifs');
  const restoration = getNestedProperty(analysis, 'uniqueFeatures.restoration');
  const anomalies = getNestedProperty(analysis, 'uniqueFeatures.anomalies');
  
  const indicators = getNestedProperty(analysis, 'stylistic.indicators');
  const estimatedEra = getNestedProperty(analysis, 'stylistic.estimatedEra');
  const confidenceLevel = getNestedProperty(analysis, 'stylistic.confidenceLevel');
  
  const likelyMaker = getNestedProperty(analysis, 'attribution.likelyMaker');
  const evidence = getNestedProperty(analysis, 'attribution.evidence');
  const probability = getNestedProperty(analysis, 'attribution.probability');
  
  const infoInPhotos = getNestedProperty(analysis, 'provenance.infoInPhotos');
  const historicIndicators = getNestedProperty(analysis, 'provenance.historicIndicators');
  const recommendedFollowup = getNestedProperty(analysis, 'provenance.recommendedFollowup');
  
  const photoCount = getNestedProperty(analysis, 'intake.photoCount');
  const photoQuality = getNestedProperty(analysis, 'intake.photoQuality');
  const lightingAngles = getNestedProperty(analysis, 'intake.lightingAngles');
  const overallImpression = getNestedProperty(analysis, 'intake.overallImpression');
  
  const factors = getNestedProperty(analysis, 'valueIndicators.factors');
  const redFlags = getNestedProperty(analysis, 'valueIndicators.redFlags');
  const references = getNestedProperty(analysis, 'valueIndicators.references');
  const followupQuestions = analysis.valueIndicators?.followupQuestions || [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">{analysis.preliminaryCategory || "Antique Analysis"}</h2>
        <p className="text-muted-foreground">{analysis.summary || "Analysis summary not available."}</p>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Category</TableHead>
            <TableHead>Details</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell className="font-medium">Physical Attributes</TableCell>
            <TableCell>
              <div className="space-y-2">
                <p><span className="font-semibold">Materials:</span> {materials}</p>
                <p><span className="font-semibold">Measurements:</span> {measurements}</p>
                <p><span className="font-semibold">Condition:</span> {condition}</p>
              </div>
            </TableCell>
          </TableRow>
          
          <TableRow>
            <TableCell className="font-medium">Inscriptions</TableCell>
            <TableCell>
              <div className="space-y-2">
                <p><span className="font-semibold">Signatures:</span> {signatures}</p>
                <p><span className="font-semibold">Hallmarks:</span> {hallmarks}</p>
                <p><span className="font-semibold">Additional Identifiers:</span> {additionalIdentifiers}</p>
              </div>
            </TableCell>
          </TableRow>
          
          <TableRow>
            <TableCell className="font-medium">Distinguishing Features</TableCell>
            <TableCell>
              <div className="space-y-2">
                <p><span className="font-semibold">Motifs & Decorations:</span> {motifs}</p>
                <p><span className="font-semibold">Restoration Signs:</span> {restoration}</p>
                <p><span className="font-semibold">Anomalies:</span> {anomalies}</p>
              </div>
            </TableCell>
          </TableRow>
          
          <TableRow>
            <TableCell className="font-medium">Stylistic Assessment</TableCell>
            <TableCell>
              <div className="space-y-2">
                <p><span className="font-semibold">Style Indicators:</span> {indicators}</p>
                <p><span className="font-semibold">Estimated Era:</span> {estimatedEra}</p>
                <p><span className="font-semibold">Confidence Level:</span> {confidenceLevel}</p>
              </div>
            </TableCell>
          </TableRow>
          
          <TableRow>
            <TableCell className="font-medium">Attribution</TableCell>
            <TableCell>
              <div className="space-y-2">
                <p><span className="font-semibold">Likely Maker:</span> {likelyMaker}</p>
                <p><span className="font-semibold">Evidence:</span> {evidence}</p>
                <p><span className="font-semibold">Probability:</span> {probability}</p>
              </div>
            </TableCell>
          </TableRow>
          
          <TableRow>
            <TableCell className="font-medium">Provenance</TableCell>
            <TableCell>
              <div className="space-y-2">
                <p><span className="font-semibold">Information in Photos:</span> {infoInPhotos}</p>
                <p><span className="font-semibold">Historic Indicators:</span> {historicIndicators}</p>
                <p><span className="font-semibold">Recommended Follow-up:</span> {recommendedFollowup}</p>
              </div>
            </TableCell>
          </TableRow>
          
          <TableRow>
            <TableCell className="font-medium">Photo Assessment</TableCell>
            <TableCell>
              <div className="space-y-2">
                <p><span className="font-semibold">Photo Count:</span> {photoCount}</p>
                <p><span className="font-semibold">Photo Quality:</span> {photoQuality}</p>
                <p><span className="font-semibold">Lighting & Angles:</span> {lightingAngles}</p>
                <p><span className="font-semibold">Overall Impression:</span> {overallImpression}</p>
              </div>
            </TableCell>
          </TableRow>
          
          <TableRow>
            <TableCell className="font-medium">Value Indicators</TableCell>
            <TableCell>
              <div className="space-y-2">
                <p><span className="font-semibold">Factors:</span> {factors}</p>
                <p><span className="font-semibold">Red Flags:</span> {redFlags}</p>
                <p><span className="font-semibold">References:</span> {references}</p>
                
                {followupQuestions && followupQuestions.length > 0 && (
                  <div>
                    <p className="font-semibold">Follow-up Questions:</p>
                    <ul className="list-disc pl-5 mt-1 space-y-1">
                      {followupQuestions.map((question, index) => (
                        <li key={index}>{question}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>

      <div className="mt-4 text-sm text-muted-foreground">
        <p className="italic">
          Note: This is an initial assessment based on provided images and information. 
          A physical inspection by a specialized expert is recommended for a definitive appraisal.
        </p>
      </div>
    </div>
  );
}

