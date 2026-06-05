"use client"

import { useState, useEffect } from "react"
import { Download } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function TransactionsByDimension() {
  const [dimension, setDimension] = useState("transaction_channel")
  const [isLoading, setIsLoading] = useState(false)
  const [data, setData] = useState<any[]>([])

  // Mock data for different dimensions
  const dimensionData = {
    transaction_channel: [
      { name: "Web", predicted: 750, reported: 650 },
      { name: "Mobile", predicted: 450, reported: 350 },
      { name: "API", predicted: 124, reported: 24 },
    ],
    transaction_payment_mode: [
      { name: "Card", predicted: 620, reported: 520 },
      { name: "UPI", predicted: 480, reported: 380 },
      { name: "NEFT", predicted: 150, reported: 80 },
      { name: "RTGS", predicted: 74, reported: 44 },
    ],
    payment_gateway_bank: [
      { name: "Bank A", predicted: 420, reported: 320 },
      { name: "Bank B", predicted: 380, reported: 280 },
      { name: "Bank C", predicted: 340, reported: 240 },
      { name: "Bank D", predicted: 184, reported: 184 },
    ],
    payer_id: [
      { name: "Top 5 Payers", predicted: 450, reported: 350 },
      { name: "Others", predicted: 874, reported: 674 },
    ],
    payee_id: [
      { name: "Top 5 Payees", predicted: 520, reported: 420 },
      { name: "Others", predicted: 804, reported: 604 },
    ],
  }

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500))

        setData(dimensionData[dimension as keyof typeof dimensionData] || [])
      } catch (error) {
        console.error("Error fetching dimension data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [dimension])

  const maxValue = data.length > 0 ? Math.max(...data.map((item) => Math.max(item.predicted, item.reported))) : 0

  const downloadCSV = () => {
    if (!data.length) return

    // Create CSV content
    const headers = ["Name", "Predicted Frauds", "Reported Frauds"]
    const rows = data.map((item) => [item.name, item.predicted, item.reported])

    const csvContent = [headers.join(","), ...rows.map((row: any[]) => row.join(","))].join("\n")

    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `fraud-by-${dimension}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Select value={dimension} onValueChange={setDimension}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select dimension" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="transaction_channel">Transaction Channel</SelectItem>
            <SelectItem value="transaction_payment_mode">Payment Mode</SelectItem>
            <SelectItem value="payment_gateway_bank">Gateway Bank</SelectItem>
            <SelectItem value="payer_id">Payer ID</SelectItem>
            <SelectItem value="payee_id">Payee ID</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" onClick={downloadCSV} disabled={isLoading || !data.length} className="ml-2">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {data.map((item) => (
            <div key={item.name} className="space-y-2 hover:bg-muted/30 p-2 rounded-md transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{item.name}</span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center text-xs">
                  <span className="w-20">Predicted</span>
                  <div className="flex-1">
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div
                        className="h-2 rounded-full bg-blue-500 transition-all duration-500 ease-in-out"
                        style={{ width: `${(item.predicted / maxValue) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <span className="ml-2 w-10 text-right">{item.predicted}</span>
                </div>
                <div className="flex items-center text-xs">
                  <span className="w-20">Reported</span>
                  <div className="flex-1">
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div
                        className="h-2 rounded-full bg-red-500 transition-all duration-500 ease-in-out"
                        style={{ width: `${(item.reported / maxValue) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <span className="ml-2 w-10 text-right">{item.reported}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

