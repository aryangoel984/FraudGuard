"use client"

import { useState } from "react"
import { AlertCircle, Download, Info, Save } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { RuleBuilder } from "@/components/rule-builder"

export default function RulesPage() {
  const [activeTab, setActiveTab] = useState("rule-engine")
  const [isRulesetActive, setIsRulesetActive] = useState(true)
  const [thresholdValue, setThresholdValue] = useState(0.75)
  const [isSaving, setIsSaving] = useState(false)
  const [testTransaction, setTestTransaction] = useState(`{
  "transaction_id": "txn_12345",
  "transaction_amount": 50000,
  "transaction_date": "2025-03-21T13:45:00Z",
  "transaction_channel": "web",
  "transaction_payment_mode": "Card",
  "payment_gateway_bank": "Example Bank",
  "payer_email": "user@example.com",
  "payer_mobile": "1234567890",
  "payer_card_brand": "Visa",
  "payer_device": "device_id_123",
  "payer_browser": "Chrome",
  "payee_id": "payee_123"
}`)
  const [testResult, setTestResult] = useState<any>(null)
  const [isTestingRule, setIsTestingRule] = useState(false)

  const handleSaveChanges = async () => {
    setIsSaving(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Success",
        description: "Rules and settings saved successfully",
      })
    } catch (error) {
      console.error("Error saving rules:", error)
      toast({
        title: "Error",
        description: "Failed to save rules and settings",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleTestRules = async () => {
    setIsTestingRule(true)
    try {
      // Validate JSON
      const transaction = JSON.parse(testTransaction)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Check if we should detect fraud based on simple rule
      const isFraud = transaction.transaction_amount > 50000

      setTestResult({
        is_fraud: isFraud,
        triggered_rules: isFraud ? ["High Amount Transaction (transaction_amount > 50000)"] : [],
        model_score: isFraud ? 0.82 : 0.35,
      })
    } catch (error) {
      console.error("Error testing rules:", error)
      toast({
        title: "Error",
        description: error instanceof SyntaxError ? "Invalid JSON format" : "Failed to test rules",
        variant: "destructive",
      })
      setTestResult(null)
    } finally {
      setIsTestingRule(false)
    }
  }

  const handleDownloadModelReport = () => {
    // Create CSV content
    const headers = ["Feature", "Importance"]
    const rows = [
      ["Transaction Amount", "85%"],
      ["Transaction Frequency", "78%"],
      ["Location Mismatch", "72%"],
      ["Device Information", "65%"],
      ["Payment Method", "60%"],
    ]

    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n")

    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", "model-feature-importance.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Fraud Detection Rules"
        description="Configure and manage fraud detection rules and model settings."
      >
        <Button onClick={handleSaveChanges} disabled={isSaving}>
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </DashboardHeader>

      <Tabs defaultValue="rule-engine" className="space-y-4" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="rule-engine">Rule Engine</TabsTrigger>
          <TabsTrigger value="model-settings">Model Settings</TabsTrigger>
          <TabsTrigger value="rule-testing">Rule Testing</TabsTrigger>
        </TabsList>

        <TabsContent value="rule-engine" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-2xl font-semibold tracking-tight">Rule Engine Configuration</h2>
              <p className="text-sm text-muted-foreground">
                Configure rules to detect fraudulent transactions based on specific criteria.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Switch checked={isRulesetActive} onCheckedChange={setIsRulesetActive} id="ruleset-active" />
              <Label htmlFor="ruleset-active">Ruleset Active</Label>
            </div>
          </div>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Rule Execution Order</AlertTitle>
            <AlertDescription>Rules are evaluated in the order they appear. Drag to reorder rules.</AlertDescription>
          </Alert>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Transaction Amount Rules</CardTitle>
              <CardDescription>Rules based on transaction amount and user spending patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <RuleBuilder
                ruleType="transaction_amount"
                initialRules={[
                  {
                    id: "rule1",
                    name: "High Amount Transaction",
                    condition: "transaction_amount > 50000",
                    active: true,
                    description: "Flag transactions with unusually high amounts",
                  },
                  {
                    id: "rule2",
                    name: "Unusual Spending Pattern",
                    condition: "transaction_amount > avg_user_transaction * 5",
                    active: true,
                    description: "Flag transactions that are 5x higher than user average",
                  },
                ]}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Location & Device Rules</CardTitle>
              <CardDescription>Rules based on user location, IP address, and device information</CardDescription>
            </CardHeader>
            <CardContent>
              <RuleBuilder
                ruleType="location_device"
                initialRules={[
                  {
                    id: "rule3",
                    name: "Location Mismatch",
                    condition: "user_country != transaction_country",
                    active: true,
                    description: "Flag transactions where user country differs from transaction country",
                  },
                  {
                    id: "rule4",
                    name: "New Device",
                    condition: "is_new_device == true && transaction_amount > 10000",
                    active: true,
                    description: "Flag high-value transactions from new devices",
                  },
                ]}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Transaction Frequency Rules</CardTitle>
              <CardDescription>Rules based on transaction frequency and patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <RuleBuilder
                ruleType="transaction_frequency"
                initialRules={[
                  {
                    id: "rule5",
                    name: "Rapid Transactions",
                    condition: "transactions_count_last_hour > 5",
                    active: true,
                    description: "Flag accounts with more than 5 transactions in the last hour",
                  },
                  {
                    id: "rule6",
                    name: "Multiple Failed Attempts",
                    condition: "failed_transactions_count_last_day > 3",
                    active: true,
                    description: "Flag accounts with more than 3 failed transactions in the last day",
                  },
                ]}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="model-settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Model Configuration</CardTitle>
              <CardDescription>Configure the AI model settings for fraud detection</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="model-type">Model Type</Label>
                <Select defaultValue="gradient_boosting">
                  <SelectTrigger id="model-type">
                    <SelectValue placeholder="Select model type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gradient_boosting">Gradient Boosting</SelectItem>
                    <SelectItem value="random_forest">Random Forest</SelectItem>
                    <SelectItem value="neural_network">Neural Network</SelectItem>
                    <SelectItem value="logistic_regression">Logistic Regression</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="threshold">Fraud Threshold ({thresholdValue})</Label>
                  <span className="text-sm text-muted-foreground">
                    Higher values reduce false positives but may miss frauds
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm">0.5</span>
                  <Input
                    id="threshold"
                    type="range"
                    min={0.5}
                    max={0.95}
                    step={0.01}
                    value={thresholdValue}
                    onChange={(e) => setThresholdValue(Number.parseFloat(e.target.value))}
                  />
                  <span className="text-sm">0.95</span>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Feature Importance</Label>
                  <Button variant="outline" size="sm" onClick={handleDownloadModelReport} className="h-8">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Transaction Amount</span>
                    <div className="w-2/3 bg-muted rounded-full h-2.5">
                      <div className="bg-primary h-2.5 rounded-full" style={{ width: "85%" }}></div>
                    </div>
                    <span className="text-sm font-medium">85%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Transaction Frequency</span>
                    <div className="w-2/3 bg-muted rounded-full h-2.5">
                      <div className="bg-primary h-2.5 rounded-full" style={{ width: "78%" }}></div>
                    </div>
                    <span className="text-sm font-medium">78%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Location Mismatch</span>
                    <div className="w-2/3 bg-muted rounded-full h-2.5">
                      <div className="bg-primary h-2.5 rounded-full" style={{ width: "72%" }}></div>
                    </div>
                    <span className="text-sm font-medium">72%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Device Information</span>
                    <div className="w-2/3 bg-muted rounded-full h-2.5">
                      <div className="bg-primary h-2.5 rounded-full" style={{ width: "65%" }}></div>
                    </div>
                    <span className="text-sm font-medium">65%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Payment Method</span>
                    <div className="w-2/3 bg-muted rounded-full h-2.5">
                      <div className="bg-primary h-2.5 rounded-full" style={{ width: "60%" }}></div>
                    </div>
                    <span className="text-sm font-medium">60%</span>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="model-retraining">Model Retraining</Label>
                  <span className="text-sm text-muted-foreground">How often the model should be retrained</span>
                </div>
                <Select defaultValue="daily">
                  <SelectTrigger id="model-retraining">
                    <SelectValue placeholder="Select retraining frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveChanges} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Model Settings"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="rule-testing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Test Rules Against Sample Transactions</CardTitle>
              <CardDescription>Test your rules against sample transactions to see how they perform</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="test-transaction">Sample Transaction (JSON)</Label>
                <textarea
                  id="test-transaction"
                  className="min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={testTransaction}
                  onChange={(e) => setTestTransaction(e.target.value)}
                />
              </div>
              <Button onClick={handleTestRules} disabled={isTestingRule}>
                {isTestingRule ? "Testing..." : "Test Rules"}
              </Button>
            </CardContent>
            <CardFooter className="flex flex-col items-start">
              <h3 className="text-lg font-semibold">Test Results</h3>
              {testResult ? (
                <div className="mt-2 w-full rounded-md border p-4">
                  <div className="flex items-center space-x-2">
                    {testResult.is_fraud ? (
                      <>
                        <AlertCircle className="h-5 w-5 text-destructive" />
                        <span className="font-medium">Fraud Detected</span>
                      </>
                    ) : (
                      <>
                        <Info className="h-5 w-5 text-primary" />
                        <span className="font-medium">No Fraud Detected</span>
                      </>
                    )}
                  </div>
                  {testResult.triggered_rules.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm text-muted-foreground">Triggered Rules:</p>
                      <ul className="mt-1 list-inside list-disc text-sm">
                        {testResult.triggered_rules.map((rule: string, i: number) => (
                          <li key={i}>{rule}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div className="mt-4">
                    <p className="text-sm font-medium">AI Model Score: {testResult.model_score.toFixed(2)}</p>
                    <div className="mt-1 h-2 w-full rounded-full bg-muted">
                      <div
                        className={`h-2 rounded-full ${testResult.model_score > 0.5 ? "bg-destructive" : "bg-primary"}`}
                        style={{ width: `${testResult.model_score * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-2 w-full rounded-md border p-4 text-center text-muted-foreground">
                  Test results will appear here after you run the test.
                </div>
              )}
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardShell>
  )
}

