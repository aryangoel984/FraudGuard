import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface ModelEvaluationProps {
  dateRange: { from: Date; to: Date }
}

export function ModelEvaluation({ dateRange }: ModelEvaluationProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Confusion Matrix</CardTitle>
          <CardDescription>Evaluation of model predictions vs actual fraud reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col items-center justify-center rounded-lg border border-muted bg-muted/50 p-6">
              <div className="text-2xl font-bold">12,450</div>
              <div className="text-sm text-muted-foreground">True Negative</div>
              <div className="mt-1 text-xs text-muted-foreground">Correctly identified as not fraud</div>
            </div>
            <div className="flex flex-col items-center justify-center rounded-lg border border-muted bg-muted/50 p-6">
              <div className="text-2xl font-bold">320</div>
              <div className="text-sm text-muted-foreground">False Positive</div>
              <div className="mt-1 text-xs text-muted-foreground">Incorrectly identified as fraud</div>
            </div>
            <div className="flex flex-col items-center justify-center rounded-lg border border-muted bg-muted/50 p-6">
              <div className="text-2xl font-bold">85</div>
              <div className="text-sm text-muted-foreground">False Negative</div>
              <div className="mt-1 text-xs text-muted-foreground">Missed actual frauds</div>
            </div>
            <div className="flex flex-col items-center justify-center rounded-lg border border-muted bg-muted/50 p-6">
              <div className="text-2xl font-bold">945</div>
              <div className="text-sm text-muted-foreground">True Positive</div>
              <div className="mt-1 text-xs text-muted-foreground">Correctly identified as fraud</div>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
          <CardDescription>Key metrics for model evaluation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="mb-1 flex items-center justify-between">
                <span className="text-sm font-medium">Accuracy</span>
                <span className="text-sm font-medium">97.1%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted">
                <div className="h-2 rounded-full bg-primary" style={{ width: "97.1%" }}></div>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Overall correctness of predictions</p>
            </div>
            <div>
              <div className="mb-1 flex items-center justify-between">
                <span className="text-sm font-medium">Precision</span>
                <span className="text-sm font-medium">74.7%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted">
                <div className="h-2 rounded-full bg-primary" style={{ width: "74.7%" }}></div>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Percentage of true fraud among predicted fraud</p>
            </div>
            <div>
              <div className="mb-1 flex items-center justify-between">
                <span className="text-sm font-medium">Recall</span>
                <span className="text-sm font-medium">91.8%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted">
                <div className="h-2 rounded-full bg-primary" style={{ width: "91.8%" }}></div>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Percentage of actual fraud correctly identified</p>
            </div>
            <div>
              <div className="mb-1 flex items-center justify-between">
                <span className="text-sm font-medium">F1 Score</span>
                <span className="text-sm font-medium">82.4%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted">
                <div className="h-2 rounded-full bg-primary" style={{ width: "82.4%" }}></div>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Harmonic mean of precision and recall</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

