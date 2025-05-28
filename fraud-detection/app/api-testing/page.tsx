"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { RealTimeFraudDetectionForm } from "@/components/api-testing/real-time-fraud-detection-form"
import { BatchFraudDetectionForm } from "@/components/api-testing/batch-fraud-detection-form"
import { FraudReportingForm } from "@/components/api-testing/fraud-reporting-form"

export default function ApiTestingPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="API Testing" description="Test the fraud detection APIs directly with sample data." />
      <Tabs defaultValue="real-time" className="space-y-4">
        <TabsList>
          <TabsTrigger value="real-time">Real-time API</TabsTrigger>
          <TabsTrigger value="batch">Batch API</TabsTrigger>
          <TabsTrigger value="reporting">Reporting API</TabsTrigger>
        </TabsList>
        <TabsContent value="real-time" className="space-y-4">
          <RealTimeFraudDetectionForm />
        </TabsContent>
        <TabsContent value="batch" className="space-y-4">
          <BatchFraudDetectionForm />
        </TabsContent>
        <TabsContent value="reporting" className="space-y-4">
          <FraudReportingForm />
        </TabsContent>
      </Tabs>
    </DashboardShell>
  )
}

