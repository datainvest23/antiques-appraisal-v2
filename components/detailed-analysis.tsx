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
  const physicalPriority = getNestedProperty(analysis, 'physicalAttributes.priority', '');
  const physicalStatus = getNestedProperty(analysis, 'physicalAttributes.status', '');
  
  const signatures = getNestedProperty(analysis, 'inscriptions.signatures');
  const hallmarks = getNestedProperty(analysis, 'inscriptions.hallmarks');
  const additionalIdentifiers = getNestedProperty(analysis, 'inscriptions.additionalIdentifiers');
  const inscriptionsPriority = getNestedProperty(analysis, 'inscriptions.priority', '');
  const inscriptionsStatus = getNestedProperty(analysis, 'inscriptions.status', '');
  
  const motifs = getNestedProperty(analysis, 'uniqueFeatures.motifs');
  const restoration = getNestedProperty(analysis, 'uniqueFeatures.restoration');
  const anomalies = getNestedProperty(analysis, 'uniqueFeatures.anomalies');
  const featuresPriority = getNestedProperty(analysis, 'uniqueFeatures.priority', '');
  const featuresStatus = getNestedProperty(analysis, 'uniqueFeatures.status', '');
  
  const indicators = getNestedProperty(analysis, 'stylistic.indicators');
  const estimatedEra = getNestedProperty(analysis, 'stylistic.estimatedEra');
  const confidenceLevel = getNestedProperty(analysis, 'stylistic.confidenceLevel');
  const stylisticPriority = getNestedProperty(analysis, 'stylistic.priority', '');
  const stylisticStatus = getNestedProperty(analysis, 'stylistic.status', '');
  
  const likelyMaker = getNestedProperty(analysis, 'attribution.likelyMaker');
  const evidence = getNestedProperty(analysis, 'attribution.evidence');
  const probability = getNestedProperty(analysis, 'attribution.probability');
  const attributionPriority = getNestedProperty(analysis, 'attribution.priority', '');
  const attributionStatus = getNestedProperty(analysis, 'attribution.status', '');
  
  const infoInPhotos = getNestedProperty(analysis, 'provenance.infoInPhotos');
  const historicIndicators = getNestedProperty(analysis, 'provenance.historicIndicators');
  const recommendedFollowup = getNestedProperty(analysis, 'provenance.recommendedFollowup');
  const provenancePriority = getNestedProperty(analysis, 'provenance.priority', '');
  const provenanceStatus = getNestedProperty(analysis, 'provenance.status', '');
  
  const photoCount = getNestedProperty(analysis, 'intake.photoCount');
  const photoQuality = getNestedProperty(analysis, 'intake.photoQuality');
  const lightingAngles = getNestedProperty(analysis, 'intake.lightingAngles');
  const overallImpression = getNestedProperty(analysis, 'intake.overallImpression');
  
  const factors = getNestedProperty(analysis, 'valueIndicators.factors');
  const redFlags = getNestedProperty(analysis, 'valueIndicators.redFlags');
  const references = getNestedProperty(analysis, 'valueIndicators.references');
  const followupQuestions = analysis.valueIndicators?.followupQuestions || [];
  const valuePriority = getNestedProperty(analysis, 'valueIndicators.priority', '');
  const valueStatus = getNestedProperty(analysis, 'valueIndicators.status', '');

  // Helper function to render priority and status badges
  const renderPriorityStatus = (priority: string, status: string) => {
    if (!priority && !status) return null;
    
    return (
      <div className="flex items-center space-x-2 mt-2">
        {priority && (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            priority === 'High' ? 'bg-red-100 text-red-800' : 
            priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 
            'bg-blue-100 text-blue-800'
          }`}>
            Priority: {priority}
          </span>
        )}
        {status && (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            status === '✓' ? 'bg-green-100 text-green-800' : 
            status === '?' ? 'bg-yellow-100 text-yellow-800' : 
            'bg-red-100 text-red-800'
          }`}>
            Status: {status}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
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
                {renderPriorityStatus(physicalPriority, physicalStatus)}
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
                {renderPriorityStatus(inscriptionsPriority, inscriptionsStatus)}
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
                {renderPriorityStatus(featuresPriority, featuresStatus)}
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
                {renderPriorityStatus(stylisticPriority, stylisticStatus)}
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
                {renderPriorityStatus(attributionPriority, attributionStatus)}
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
                {renderPriorityStatus(provenancePriority, provenanceStatus)}
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
                {renderPriorityStatus(valuePriority, valueStatus)}
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

