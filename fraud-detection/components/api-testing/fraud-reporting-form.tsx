"use client"

import type React from "react"

import { useState } from "react"
import { ArrowRight, CheckCircle, Copy, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"

interface FraudReportResponse {
  transaction_id: string
  reporting_acknowledged: boolean
  failure_code: number
}

export function FraudReportingForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [response, setResponse] = useState<FraudReportResponse | null>(null)
  const [formData, setFormData] = useState({
    transaction_id: `txn_${Math.floor(Math.random() * 100000)}`,
    reporting_entity_id: "entity_123",
    fraud_details: "Unauthorized transaction reported by customer",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setResponse(null)

    try {
      const response = await fetch("/api/fraud/report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }

      const data = await response.json()
      setResponse(data)
    } catch (error) {
      console.error("Error submitting form:", error)
      toast({
        title: "Error",
        description: "Failed to process the request. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied",
      description: "JSON copied to clipboard",
    })
  }

  const getRequestJson = () => {
    return JSON.stringify(formData, null, 2)
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Fraud Reporting</CardTitle>
          <CardDescription>
            Report a transaction as fraudulent to update the system and improve detection.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="transaction_id">Transaction ID</Label>
              <Input
                id="transaction_id"
                name="transaction_id"
                value={formData.transaction_id}
                onChange={handleInputChange}
                required
              />
              <p className="text-xs text-muted-foreground">
                The ID of the transaction that is being reported as fraudulent
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reporting_entity_id">Reporting Entity ID</Label>
              <Input
                id="reporting_entity_id"
                name="reporting_entity_id"
                value={formData.reporting_entity_id}
                onChange={handleInputChange}
                required
              />
              <p className="text-xs text-muted-foreground">
                The ID of the entity (user, system, or organization) reporting the fraud
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fraud_details">Fraud Details</Label>
              <Textarea
                id="fraud_details"
                name="fraud_details"
                value={formData.fraud_details}
                onChange={handleInputChange}
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                Additional details about the fraud, such as how it was discovered or reported
              </p>
            </div>
          </form>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSubmit} disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                Submit Fraud Report
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>API Request & Response</CardTitle>
          <CardDescription>View the request and response data.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Request</h3>
              <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => copyToClipboard(getRequestJson())}>
                <Copy className="h-4 w-4" />
                <span className="ml-2">Copy</span>
              </Button>
            </div>
            <div className="rounded-md bg-muted p-4">
              <pre className="text-xs">{getRequestJson()}</pre>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <h3 className="text-sm font-medium">Response</h3>
            {isLoading ? (
              <div className="flex h-40 items-center justify-center rounded-md border border-dashed">
                <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : response ? (
              <div className="space-y-4">
                <div className="rounded-md bg-muted p-4">
                  <pre className="text-xs">{JSON.stringify(response, null, 2)}</pre>
                </div>

                <div className="rounded-md border p-4">
                  <div className="mb-4 flex items-center gap-2">
                    {response.reporting_acknowledged ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <RefreshCw className="h-5 w-5 text-amber-500" />
                    )}
                    <h3 className="text-lg font-semibold">
                      {response.reporting_acknowledged ? "Fraud Report Acknowledged" : "Failed to Process Report"}
                    </h3>
                  </div>

                  <div className="grid gap-2">
                    <div className="grid grid-cols-2 gap-1">
                      <span className="text-sm font-medium">Transaction ID:</span>
                      <span className="text-sm">{response.transaction_id}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      <span className="text-sm font-medium">Status:</span>
                      <span className="text-sm">{response.reporting_acknowledged ? "Success" : "Failed"}</span>
                    </div>
                    {response.failure_code > 0 && (
                      <div className="grid grid-cols-2 gap-1">
                        <span className="text-sm font-medium">Failure Code:</span>
                        <span className="text-sm">{response.failure_code}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex h-40 items-center justify-center rounded-md border border-dashed">
                <p className="text-sm text-muted-foreground">Submit the form to see the response</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

