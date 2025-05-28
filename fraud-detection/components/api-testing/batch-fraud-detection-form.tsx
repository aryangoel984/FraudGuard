"use client"

import type React from "react"

import { useState } from "react"
import { AlertCircle, ArrowRight, CheckCircle, Copy, Plus, RefreshCw, Trash2 } from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Transaction {
  transaction_id: string
  transaction_amount: number
  transaction_date: string
  transaction_channel: string
  transaction_payment_mode: string
  payment_gateway_bank: string
  payer_email: string
  payer_mobile: string
  payer_card_brand: string
  payer_device: string
  payer_browser: string
  payee_id: string
}

interface BatchResponse {
  [key: string]: {
    is_fraud: boolean
    fraud_reason: string
    fraud_score: number
  }
}

export function BatchFraudDetectionForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [response, setResponse] = useState<BatchResponse | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      transaction_id: `txn_${Math.floor(Math.random() * 100000)}`,
      transaction_amount: 5000,
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
    },
    {
      transaction_id: `txn_${Math.floor(Math.random() * 100000)}`,
      transaction_amount: 75000,
      transaction_date: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss'Z'"),
      transaction_channel: "mobile",
      transaction_payment_mode: "UPI",
      payment_gateway_bank: "Example Bank",
      payer_email: "user2@example.com",
      payer_mobile: "9876543210",
      payer_card_brand: "",
      payer_device: "device_id_456",
      payer_browser: "",
      payee_id: "payee_456",
    },
  ])
  const [jsonInput, setJsonInput] = useState("")
  const [activeTab, setActiveTab] = useState("form")

  const handleAddTransaction = () => {
    setTransactions([
      ...transactions,
      {
        transaction_id: `txn_${Math.floor(Math.random() * 100000)}`,
        transaction_amount: 1000,
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
      },
    ])
  }

  const handleRemoveTransaction = (index: number) => {
    setTransactions(transactions.filter((_, i) => i !== index))
  }

  const handleTransactionChange = (index: number, field: keyof Transaction, value: string | number) => {
    const updatedTransactions = [...transactions]
    updatedTransactions[index] = {
      ...updatedTransactions[index],
      [field]: field === "transaction_amount" ? Number(value) : value,
    }
    setTransactions(updatedTransactions)
  }

  const handleJsonInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJsonInput(e.target.value)
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    setResponse(null)

    try {
      let payload

      if (activeTab === "form") {
        payload = { transactions }
      } else {
        try {
          payload = JSON.parse(jsonInput)
        } catch (error) {
          toast({
            title: "Invalid JSON",
            description: "Please check your JSON format and try again.",
            variant: "destructive",
          })
          setIsLoading(false)
          return
        }
      }

      const response = await fetch("/api/fraud/detect/batch", {
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
    return JSON.stringify({ transactions }, null, 2)
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Batch Fraud Detection</CardTitle>
          <CardDescription>Test the batch fraud detection API by submitting multiple transactions.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="form">Form Input</TabsTrigger>
              <TabsTrigger value="json">JSON Input</TabsTrigger>
            </TabsList>
            <TabsContent value="form" className="space-y-4">
              {transactions.map((transaction, index) => (
                <div key={index} className="rounded-md border p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-sm font-medium">Transaction #{index + 1}</h3>
                    {transactions.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveTransaction(index)}
                        className="h-8 px-2 text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`transaction_id_${index}`}>Transaction ID</Label>
                        <Input
                          id={`transaction_id_${index}`}
                          value={transaction.transaction_id}
                          onChange={(e) => handleTransactionChange(index, "transaction_id", e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`transaction_amount_${index}`}>Amount</Label>
                        <Input
                          id={`transaction_amount_${index}`}
                          type="number"
                          value={transaction.transaction_amount}
                          onChange={(e) => handleTransactionChange(index, "transaction_amount", e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`transaction_channel_${index}`}>Channel</Label>
                        <Select
                          value={transaction.transaction_channel}
                          onValueChange={(value) => handleTransactionChange(index, "transaction_channel", value)}
                        >
                          <SelectTrigger id={`transaction_channel_${index}`}>
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
                        <Label htmlFor={`transaction_payment_mode_${index}`}>Payment Mode</Label>
                        <Select
                          value={transaction.transaction_payment_mode}
                          onValueChange={(value) => handleTransactionChange(index, "transaction_payment_mode", value)}
                        >
                          <SelectTrigger id={`transaction_payment_mode_${index}`}>
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
                  </div>
                </div>
              ))}

              <Button variant="outline" onClick={handleAddTransaction} className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Add Transaction
              </Button>
            </TabsContent>
            <TabsContent value="json" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="json_input">JSON Request Body</Label>
                <textarea
                  id="json_input"
                  className="min-h-[300px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder={`{
  "transactions": [
    {
      "transaction_id": "txn_12345",
      "transaction_amount": 5000,
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
    }
  ]
}`}
                  value={jsonInput}
                  onChange={handleJsonInputChange}
                />
              </div>
            </TabsContent>
          </Tabs>
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
                Test Batch Detection
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>API Response</CardTitle>
          <CardDescription>View the batch detection results.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {activeTab === "form" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Request</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2"
                  onClick={() => copyToClipboard(getRequestJson())}
                >
                  <Copy className="h-4 w-4" />
                  <span className="ml-2">Copy</span>
                </Button>
              </div>
              <div className="rounded-md bg-muted p-4">
                <pre className="text-xs">{getRequestJson()}</pre>
              </div>
            </div>
          )}

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

                <div className="space-y-4">
                  {Object.entries(response).map(([transactionId, result]) => (
                    <div key={transactionId} className="rounded-md border p-4">
                      <div className="mb-2 flex items-center gap-2">
                        {result.is_fraud ? (
                          <AlertCircle className="h-5 w-5 text-destructive" />
                        ) : (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        )}
                        <h3 className="font-semibold">
                          Transaction: {transactionId} - {result.is_fraud ? "Fraud Detected" : "No Fraud Detected"}
                        </h3>
                      </div>

                      <div className="grid gap-2">
                        <div className="grid grid-cols-2 gap-1">
                          <span className="text-sm font-medium">Fraud Score:</span>
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-24 rounded-full bg-muted">
                              <div
                                className={`h-2 rounded-full ${
                                  result.fraud_score > 0.5 ? "bg-destructive" : "bg-green-500"
                                }`}
                                style={{ width: `${result.fraud_score * 100}%` }}
                              />
                            </div>
                            <span className="text-sm">{(result.fraud_score * 100).toFixed(0)}%</span>
                          </div>
                        </div>
                        {result.fraud_reason && (
                          <div className="grid grid-cols-2 gap-1">
                            <span className="text-sm font-medium">Reason:</span>
                            <span className="text-sm">{result.fraud_reason}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
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

