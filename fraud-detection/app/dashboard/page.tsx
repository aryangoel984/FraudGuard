"use client"

import { useState } from "react"
import { Download, Filter } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { DateRangePicker } from "@/components/date-range-picker"
import { FraudMetricsCards } from "@/components/fraud-metrics-cards"
import { FraudTimeSeries } from "@/components/fraud-time-series"
import { ModelEvaluation } from "@/components/model-evaluation"
import { TransactionTable } from "@/components/transaction-table"
import { TransactionsByDimension } from "@/components/transactions-by-dimension"

export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    to: new Date(),
  })

  return (
    <DashboardShell>
      <DashboardHeader heading="Dashboard" description="Monitor and analyze fraud detection performance.">
        <div className="flex items-center gap-2">
          <DateRangePicker date={dateRange} onDateChange={setDateRange} />
          <Button variant="outline" size="icon">
            <Download className="h-4 w-4" />
            <span className="sr-only">Download data</span>
          </Button>
        </div>
      </DashboardHeader>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <FraudMetricsCards />
      </div>
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="evaluation">Model Evaluation</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Fraud Detection Trend</CardTitle>
                <CardDescription>Comparison of predicted vs reported frauds over time</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <FraudTimeSeries />
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Fraud by Dimension</CardTitle>
                <CardDescription>Comparison across different transaction dimensions</CardDescription>
              </CardHeader>
              <CardContent>
                <TransactionsByDimension />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="transactions" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-1 items-center space-x-2">
              <Input
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 w-[150px] lg:w-[250px]"
              />
              <Button variant="outline" size="sm" className="h-8 gap-1">
                <Filter className="h-3.5 w-3.5" />
                <span>Filter</span>
              </Button>
            </div>
          </div>
          <TransactionTable searchQuery={searchQuery} dateRange={dateRange} />
        </TabsContent>
        <TabsContent value="evaluation" className="space-y-4">
          <ModelEvaluation dateRange={dateRange} />
        </TabsContent>
      </Tabs>
    </DashboardShell>
  )
}

