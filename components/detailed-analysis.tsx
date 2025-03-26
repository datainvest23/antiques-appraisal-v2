import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, HelpCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import type { AntiqueAnalysisResult } from "@/lib/openai"

interface DetailedAnalysisProps {
  analysis: AntiqueAnalysisResult
}

export default function DetailedAnalysis({ analysis }: DetailedAnalysisProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <div className="flex items-center space-x-2">
          <h2 className="text-2xl font-bold">{analysis.preliminaryCategory}</h2>
          <Badge variant="outline" className="ml-2">
            {analysis.stylistic.confidenceLevel} Confidence
          </Badge>
        </div>
        <p className="text-muted-foreground">
          Here&apos;s what we&apos;ve found about your antique item.
        </p>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Preliminary Assessment</AlertTitle>
        <AlertDescription>
          This is a preliminary review based solely on photographs. A physical inspection and deeper research may be
          needed to confirm authenticity, condition, or value.
        </AlertDescription>
      </Alert>

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="physical">
          <AccordionTrigger>Physical Attributes</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium">Materials & Techniques</h4>
                <p className="text-sm text-muted-foreground">{analysis.physicalAttributes.materials}</p>
              </div>
              <div>
                <h4 className="font-medium">Measurements</h4>
                <p className="text-sm text-muted-foreground">{analysis.physicalAttributes.measurements}</p>
              </div>
              <div>
                <h4 className="font-medium">Condition</h4>
                <p className="text-sm text-muted-foreground">{analysis.physicalAttributes.condition}</p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="inscriptions">
          <AccordionTrigger>Inscriptions, Marks, or Labels</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium">Signatures / Maker&apos;s Marks</h4>
                <p className="text-sm text-muted-foreground">{analysis.inscriptions.signatures}</p>
              </div>
              <div>
                <h4 className="font-medium">Hallmarks, Stamps, or Labels</h4>
                <p className="text-sm text-muted-foreground">{analysis.inscriptions.hallmarks}</p>
              </div>
              <div>
                <h4 className="font-medium">Additional Identifiers</h4>
                <p className="text-sm text-muted-foreground">{analysis.inscriptions.additionalIdentifiers}</p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="features">
          <AccordionTrigger>Distinguishing or Unique Features</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium">Motifs & Decorations</h4>
                <p className="text-sm text-muted-foreground">{analysis.uniqueFeatures.motifs}</p>
              </div>
              <div>
                <h4 className="font-medium">Signs of Restoration or Alteration</h4>
                <p className="text-sm text-muted-foreground">{analysis.uniqueFeatures.restoration}</p>
              </div>
              <div>
                <h4 className="font-medium">Anomalies</h4>
                <p className="text-sm text-muted-foreground">{analysis.uniqueFeatures.anomalies}</p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="stylistic">
          <AccordionTrigger>Stylistic Assessment & Possible Period</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium">Style Indicators</h4>
                <p className="text-sm text-muted-foreground">{analysis.stylistic.indicators}</p>
              </div>
              <div>
                <h4 className="font-medium">Estimated Era / Date Range</h4>
                <p className="text-sm text-muted-foreground">{analysis.stylistic.estimatedEra}</p>
              </div>
              <div>
                <h4 className="font-medium">Confidence Level</h4>
                <p className="text-sm text-muted-foreground">{analysis.stylistic.confidenceLevel}</p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="attribution">
          <AccordionTrigger>Preliminary Attribution</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium">Likely Maker / Workshop / Artist</h4>
                <p className="text-sm text-muted-foreground">{analysis.attribution.likelyMaker}</p>
              </div>
              <div>
                <h4 className="font-medium">Evidence or Rationale</h4>
                <p className="text-sm text-muted-foreground">{analysis.attribution.evidence}</p>
              </div>
              <div>
                <h4 className="font-medium">Probability & Next Steps</h4>
                <p className="text-sm text-muted-foreground">{analysis.attribution.probability}</p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="provenance">
          <AccordionTrigger>Potential Provenance Clues</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium">Provenance Info in Photos</h4>
                <p className="text-sm text-muted-foreground">{analysis.provenance.infoInPhotos}</p>
              </div>
              <div>
                <h4 className="font-medium">Historic or Regional Indicators</h4>
                <p className="text-sm text-muted-foreground">{analysis.provenance.historicIndicators}</p>
              </div>
              <div>
                <h4 className="font-medium">Recommended Follow-up</h4>
                <p className="text-sm text-muted-foreground">{analysis.provenance.recommendedFollowup}</p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="intake">
          <AccordionTrigger>Intake & Identification</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium">Number and Type of Photos Provided</h4>
                <p className="text-sm text-muted-foreground">{analysis.intake.photoCount}</p>
              </div>
              <div>
                <h4 className="font-medium">Photo Quality & Clarity</h4>
                <p className="text-sm text-muted-foreground">{analysis.intake.photoQuality}</p>
              </div>
              <div>
                <h4 className="font-medium">Lighting & Angles</h4>
                <p className="text-sm text-muted-foreground">{analysis.intake.lightingAngles}</p>
              </div>
              <div>
                <h4 className="font-medium">Overall Impression</h4>
                <p className="text-sm text-muted-foreground">{analysis.intake.overallImpression}</p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="value">
          <AccordionTrigger>Initial Value Indicators & Caveats</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium">Factors Affecting Value</h4>
                <p className="text-sm text-muted-foreground">{analysis.valueIndicators.factors}</p>
              </div>
              <div>
                <h4 className="font-medium">Red Flags or Concerns</h4>
                <p className="text-sm text-muted-foreground">{analysis.valueIndicators.redFlags}</p>
              </div>
              <div>
                <h4 className="font-medium">References and Further Research</h4>
                <p className="text-sm text-muted-foreground">{analysis.valueIndicators.references}</p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {analysis.valueIndicators.followupQuestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <HelpCircle className="h-5 w-5 mr-2 text-primary" />
              Follow-up Questions
            </CardTitle>
            <CardDescription>
              Providing answers to these questions will help improve the accuracy of the valuation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {analysis.valueIndicators.followupQuestions.map((question, index) => (
                <li key={index} className="flex items-start">
                  <span className="font-medium mr-2">{index + 1}.</span>
                  <span>{question}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <p className="text-muted-foreground">
        We&apos;ll analyze the item&apos;s condition, materials, and other key features.
      </p>
    </div>
  )
}

