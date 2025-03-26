import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, HelpCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import type { AntiqueAnalysisResult } from "@/lib/openai"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface DetailedAnalysisProps {
  analysis: AntiqueAnalysisResult
}

export default function DetailedAnalysis({ analysis }: DetailedAnalysisProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          {analysis.preliminaryCategory}
          <Badge variant="outline" className="ml-2 text-xs font-normal">
            Preliminary Confidence
          </Badge>
        </h2>
      </div>

      <p className="text-muted-foreground">{analysis.summary}</p>

      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-1/3 font-semibold">Category</TableHead>
              <TableHead>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Physical Attributes */}
            <TableRow className="bg-background hover:bg-muted/20">
              <TableCell className="font-medium align-top">Physical Attributes</TableCell>
              <TableCell>
                <div className="space-y-2">
                  <div>
                    <span className="font-medium text-sm">Materials & Techniques:</span>
                    <p className="text-sm text-muted-foreground">{analysis.physicalAttributes.materials}</p>
                  </div>
                  <div>
                    <span className="font-medium text-sm">Measurements:</span>
                    <p className="text-sm text-muted-foreground">{analysis.physicalAttributes.measurements}</p>
                  </div>
                  <div>
                    <span className="font-medium text-sm">Condition:</span>
                    <p className="text-sm text-muted-foreground">{analysis.physicalAttributes.condition}</p>
                  </div>
                </div>
              </TableCell>
            </TableRow>

            {/* Inscriptions, Marks, or Labels */}
            <TableRow className="bg-background hover:bg-muted/20">
              <TableCell className="font-medium align-top">Inscriptions, Marks, or Labels</TableCell>
              <TableCell>
                <div className="space-y-2">
                  <div>
                    <span className="font-medium text-sm">Signatures / Maker&apos;s Marks:</span>
                    <p className="text-sm text-muted-foreground">{analysis.inscriptions.signatures}</p>
                  </div>
                  <div>
                    <span className="font-medium text-sm">Hallmarks, Stamps, or Labels:</span>
                    <p className="text-sm text-muted-foreground">{analysis.inscriptions.hallmarks}</p>
                  </div>
                  <div>
                    <span className="font-medium text-sm">Additional Identifiers:</span>
                    <p className="text-sm text-muted-foreground">{analysis.inscriptions.additionalIdentifiers}</p>
                  </div>
                </div>
              </TableCell>
            </TableRow>

            {/* Distinguishing or Unique Features */}
            <TableRow className="bg-background hover:bg-muted/20">
              <TableCell className="font-medium align-top">Distinguishing or Unique Features</TableCell>
              <TableCell>
                <div className="space-y-2">
                  <div>
                    <span className="font-medium text-sm">Motifs & Decorations:</span>
                    <p className="text-sm text-muted-foreground">{analysis.uniqueFeatures.motifs}</p>
                  </div>
                  <div>
                    <span className="font-medium text-sm">Signs of Restoration or Alteration:</span>
                    <p className="text-sm text-muted-foreground">{analysis.uniqueFeatures.restoration}</p>
                  </div>
                  <div>
                    <span className="font-medium text-sm">Anomalies:</span>
                    <p className="text-sm text-muted-foreground">{analysis.uniqueFeatures.anomalies}</p>
                  </div>
                </div>
              </TableCell>
            </TableRow>

            {/* Stylistic Assessment & Possible Period */}
            <TableRow className="bg-background hover:bg-muted/20">
              <TableCell className="font-medium align-top">Stylistic Assessment & Possible Period</TableCell>
              <TableCell>
                <div className="space-y-2">
                  <div>
                    <span className="font-medium text-sm">Style Indicators:</span>
                    <p className="text-sm text-muted-foreground">{analysis.stylistic.indicators}</p>
                  </div>
                  <div>
                    <span className="font-medium text-sm">Estimated Era / Date Range:</span>
                    <p className="text-sm text-muted-foreground">{analysis.stylistic.estimatedEra}</p>
                  </div>
                  <div>
                    <span className="font-medium text-sm">Confidence Level:</span>
                    <p className="text-sm text-muted-foreground">
                      <Badge variant={analysis.stylistic.confidenceLevel === "High" ? "default" : 
                        analysis.stylistic.confidenceLevel === "Medium" ? "secondary" : "outline"}>
                        {analysis.stylistic.confidenceLevel}
                      </Badge>
                    </p>
                  </div>
                </div>
              </TableCell>
            </TableRow>

            {/* Preliminary Attribution */}
            <TableRow className="bg-background hover:bg-muted/20">
              <TableCell className="font-medium align-top">Preliminary Attribution</TableCell>
              <TableCell>
                <div className="space-y-2">
                  <div>
                    <span className="font-medium text-sm">Likely Maker / Workshop / Artist:</span>
                    <p className="text-sm text-muted-foreground">{analysis.attribution.likelyMaker}</p>
                  </div>
                  <div>
                    <span className="font-medium text-sm">Evidence or Rationale:</span>
                    <p className="text-sm text-muted-foreground">{analysis.attribution.evidence}</p>
                  </div>
                  <div>
                    <span className="font-medium text-sm">Probability:</span>
                    <p className="text-sm text-muted-foreground">{analysis.attribution.probability}</p>
                  </div>
                </div>
              </TableCell>
            </TableRow>

            {/* Potential Provenance Clues */}
            <TableRow className="bg-background hover:bg-muted/20">
              <TableCell className="font-medium align-top">Potential Provenance Clues</TableCell>
              <TableCell>
                <div className="space-y-2">
                  <div>
                    <span className="font-medium text-sm">Provenance Info in Photos:</span>
                    <p className="text-sm text-muted-foreground">{analysis.provenance.infoInPhotos}</p>
                  </div>
                  <div>
                    <span className="font-medium text-sm">Historic or Regional Indicators:</span>
                    <p className="text-sm text-muted-foreground">{analysis.provenance.historicIndicators}</p>
                  </div>
                  <div>
                    <span className="font-medium text-sm">Recommended Follow-up:</span>
                    <p className="text-sm text-muted-foreground">{analysis.provenance.recommendedFollowup}</p>
                  </div>
                </div>
              </TableCell>
            </TableRow>

            {/* Initial Value Indicators & Caveats */}
            <TableRow className="bg-background hover:bg-muted/20">
              <TableCell className="font-medium align-top">Initial Value Indicators & Caveats</TableCell>
              <TableCell>
                <div className="space-y-2">
                  <div>
                    <span className="font-medium text-sm">Factors Affecting Value:</span>
                    <p className="text-sm text-muted-foreground">{analysis.valueIndicators.factors}</p>
                  </div>
                  <div>
                    <span className="font-medium text-sm">Red Flags or Concerns:</span>
                    <p className="text-sm text-muted-foreground">{analysis.valueIndicators.redFlags}</p>
                  </div>
                  <div>
                    <span className="font-medium text-sm">References and Further Research:</span>
                    <p className="text-sm text-muted-foreground">{analysis.valueIndicators.references}</p>
                  </div>
                </div>
              </TableCell>
            </TableRow>
            
            {/* Follow-up Questions */}
            <TableRow className="bg-background hover:bg-muted/20">
              <TableCell className="font-medium align-top">Follow-up Questions</TableCell>
              <TableCell>
                <div className="space-y-2">
                  <ul className="list-disc pl-5 text-sm space-y-1">
                    {analysis.valueIndicators.followupQuestions.map((question, index) => (
                      <li key={index} className="text-muted-foreground">{question}</li>
                    ))}
                  </ul>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
      
      <div className="text-xs text-muted-foreground border-t pt-4 mt-6">
        <p className="font-medium">Note:</p>
        <p>This is a preliminary review based solely on photographs. A physical inspection and deeper research may be needed to confirm authenticity, condition, or value.</p>
      </div>
    </div>
  )
}

