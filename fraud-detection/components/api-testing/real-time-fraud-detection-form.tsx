"use client"

import type React from "react"

import { useState } from "react"
import { AlertCircle, ArrowRight, CheckCircle, Copy, RefreshCw } from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/components/ui/use-toast"

interface FraudDetectionResponse {
  transaction_id: string
  is_fraud: boolean
  fraud_source: string
  fraud_reason: string
  fraud_score: number
}

export function RealTimeFraudDetectionForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [response, setResponse] = useState<FraudDetectionResponse | null>(null)
  const [formData, setFormData] = useState({
    transaction_id: `txn_${Math.floor(Math.random() * 100000)}`,
    transaction_amount: "5000",
    transaction_date: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss'Z'"),
    transaction_channel: "web",
    transaction_payment_mode: "Card",
    payment_gateway_bank: "Example Bank",
    payer_email: "user@example.com",
    payer_mobile: "1234567890",
    payer_card_brand: "Visa",
    payer_device: "device_id_123",
    payer_browser: "Chrome",
    payee_id: "payee_123",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleGenerateNewId = () => {
    setFormData((prev) => ({
      ...prev,
      transaction_id: `txn_${Math.floor(Math.random() * 100000)}`,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setResponse(null)

    try {
      // Convert amount to number
      const payload = {
        ...formData,
        transaction_amount: Number(formData.transaction_amount),
      }

      const response = await fetch("/api/fraud/detect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
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
    return JSON.stringify(
      {
        ...formData,
        transaction_amount: Number(formData.transaction_amount),
      },
      null,
      2,
    )
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Real-time Fraud Detection</CardTitle>
          <CardDescription>Test the real-time fraud detection API by submitting a sample transaction.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-end gap-2">
              <div className="flex-1 space-y-2">
                <Label htmlFor="transaction_id">Transaction ID</Label>
                <Input
                  id="transaction_id"
                  name="transaction_id"
                  value={formData.transaction_id}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <Button type="button" variant="outline" size="icon" onClick={handleGenerateNewId} className="mb-0.5">
                <RefreshCw className="h-4 w-4" />
                <span className="sr-only">Generate new ID</span>
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="transaction_amount">Amount</Label>
              <Input
                id="transaction_amount"
                name="transaction_amount"
                type="number"
                value={formData.transaction_amount}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="transaction_date">Date</Label>
              <Input
                id="transaction_date"
                name="transaction_date"
                value={formData.transaction_date}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="transaction_channel">Channel</Label>
                <Select
                  value={formData.transaction_channel}
                  onValueChange={(value) => handleSelectChange("transaction_channel", value)}
                >
                  <SelectTrigger id="transaction_channel">
                    <SelectValue placeholder="Select channel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="web">Web</SelectItem>
                    <SelectItem value="mobile">Mobile</SelectItem>
                    <SelectItem value="api">API</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="transaction_payment_mode">Payment Mode</Label>
                <Select
                  value={formData.transaction_payment_mode}
                  onValueChange={(value) => handleSelectChange("transaction_payment_mode", value)}
                >
                  <SelectTrigger id="transaction_payment_mode">
                    <SelectValue placeholder="Select payment mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Card">Card</SelectItem>
                    <SelectItem value="UPI">UPI</SelectItem>
                    <SelectItem value="NEFT">NEFT</SelectItem>
                    <SelectItem value="RTGS">RTGS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment_gateway_bank">Bank</Label>
              <Input
                id="payment_gateway_bank"
                name="payment_gateway_bank"
                value={formData.payment_gateway_bank}
                onChange={handleInputChange}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="payer_email">Email</Label>
                <Input
                  id="payer_email"
                  name="payer_email"
                  type="email"
                  value={formData.payer_email}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="payer_mobile">Mobile</Label>
                <Input
                  id="payer_mobile"
                  name="payer_mobile"
                  value={formData.payer_mobile}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="payer_card_brand">Card Brand</Label>
                <Input
                  id="payer_card_brand"
                  name="payer_card_brand"
                  value={formData.payer_card_brand}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="payee_id">Payee ID</Label>
                <Input id="payee_id" name="payee_id" value={formData.payee_id} onChange={handleInputChange} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="payer_device">Device ID</Label>
                <Input
                  id="payer_device"
                  name="payer_device"
                  value={formData.payer_device}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="payer_browser">Browser</Label>
                <Input
                  id="payer_browser"
                  name="payer_browser"
                  value={formData.payer_browser}
                  onChange={handleInputChange}
                />
              </div>
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
                Test Fraud Detection
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
                    {response.is_fraud ? (
                      <AlertCircle className="h-5 w-5 text-destructive" />
                    ) : (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                    <h3 className="text-lg font-semibold">
                      {response.is_fraud ? "Fraud Detected" : "No Fraud Detected"}
                    </h3>
                  </div>

                  <div className="grid gap-2">
                    <div className="grid grid-cols-2 gap-1">
                      <span className="text-sm font-medium">Transaction ID:</span>
                      <span className="text-sm">{response.transaction_id}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      <span className="text-sm font-medium">Fraud Score:</span>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-24 rounded-full bg-muted">
                          <div
                            className={`h-2 rounded-full ${
                              response.fraud_score > 0.5 ? "bg-destructive" : "bg-green-500"
                            }`}
                            style={{ width: `${response.fraud_score * 100}%` }}
                          />
                        </div>
                        <span className="text-sm">{(response.fraud_score * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                    {response.fraud_source && (
                      <div className="grid grid-cols-2 gap-1">
                        <span className="text-sm font-medium">Detection Source:</span>
                        <span className="text-sm capitalize">{response.fraud_source}</span>
                      </div>
                    )}
                    {response.fraud_reason && (
                      <div className="grid grid-cols-2 gap-1">
                        <span className="text-sm font-medium">Reason:</span>
                        <span className="text-sm">{response.fraud_reason}</span>
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

