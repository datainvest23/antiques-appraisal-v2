import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface ExpertAnalysisButtonsProps {
  onHistoryExpertClick: () => void;
  onEvaluationExpertClick: () => void;
  isHistoryExpertAnalyzing: boolean;
  isEvaluationExpertAnalyzing: boolean;
  historyExpertResult: any;
  evaluationExpertResult: any;
}

export default function ExpertAnalysisButtons({
  onHistoryExpertClick,
  onEvaluationExpertClick,
  isHistoryExpertAnalyzing,
  isEvaluationExpertAnalyzing,
  historyExpertResult,
  evaluationExpertResult
}: ExpertAnalysisButtonsProps) {
  return (
    <div className="space-y-6">
      <div className="mt-6 space-y-3">
        <h3 className="text-lg font-medium text-center">Get Additional Expert Analysis</h3>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={onHistoryExpertClick}
            disabled={isHistoryExpertAnalyzing}
            className="flex-1"
          >
            {isHistoryExpertAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing History...
              </>
            ) : (
              "History Expert"
            )}
          </Button>
          
          <Button
            onClick={onEvaluationExpertClick}
            disabled={isEvaluationExpertAnalyzing}
            className="flex-1"
          >
            {isEvaluationExpertAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Evaluating Market...
              </>
            ) : (
              "Evaluation Expert"
            )}
          </Button>
        </div>
      </div>

      {historyExpertResult && (
        <Card className="mt-6">
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold mb-4">Historical & Cultural Context</h3>
            <div className="prose max-w-none">
              <div dangerouslySetInnerHTML={{ __html: historyExpertResult.content }} />
            </div>
          </CardContent>
        </Card>
      )}

      {evaluationExpertResult && (
        <Card className="mt-6">
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold mb-4">Market Valuation & Comparisons</h3>
            <div className="prose max-w-none">
              <div dangerouslySetInnerHTML={{ __html: evaluationExpertResult.content }} />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 