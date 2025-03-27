import { formatDate } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Award, Download, Play, Share2 } from "lucide-react"
import Image from "next/image"

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
}

interface ValuationDetailProps {
  valuation: Valuation
}

export default function ValuationDetail({ valuation }: ValuationDetailProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{valuation.title}</h1>
          <p className="text-muted-foreground">Created on {formatDate(valuation.created_at)}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      {valuation.is_detailed && (
        <Badge className="flex items-center w-fit">
          <Award className="h-3 w-3 mr-1" />
          Detailed Valuation
        </Badge>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Images</CardTitle>
            <CardDescription>Images of your antique item</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {valuation.images.map((image, index) => (
                <div key={index} className="relative aspect-square">
                  <Image
                    src={image}
                        alt={`Antique item ${index + 1}`}
                    fill
                    className="object-cover rounded-lg"
                      />
                    </div>
                  ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
            <CardDescription>Concise overview of your antique</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>{valuation.summary}</p>

            <Button variant="outline" size="sm">
              <Play className="h-4 w-4 mr-2" />
              Play Audio Summary
            </Button>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="analysis" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="analysis">Full Analysis</TabsTrigger>
          <TabsTrigger value="feedback">Your Feedback</TabsTrigger>
          <TabsTrigger value="refined">Refined Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="analysis" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Analysis</CardTitle>
              <CardDescription>Initial analysis of your antique</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-line">{valuation.assistant_response}</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="feedback" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Feedback</CardTitle>
              <CardDescription>Additional information you provided</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-line">{valuation.user_comment}</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="refined" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Refined Analysis</CardTitle>
              <CardDescription>Final analysis incorporating your feedback</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-line">{valuation.assistant_follow_up}</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

