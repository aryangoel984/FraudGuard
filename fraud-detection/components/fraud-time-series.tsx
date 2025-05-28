"use client"

import { useEffect, useState } from "react"
import { BarChart, Download, LineChart } from "lucide-react"
import type { ChartOptions } from "chart.js"
import {
  Chart,
  LineElement,
  BarElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip as ChartTooltip,
  Legend,
} from "chart.js"
import { Bar, Line } from "react-chartjs-2"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

Chart.register(LineElement, BarElement, PointElement, LinearScale, CategoryScale, ChartTooltip, Legend)

export function FraudTimeSeries() {
  const [activeChart, setActiveChart] = useState<"line" | "bar">("line")
  const [timePeriod, setTimePeriod] = useState("monthly")
  const [chartData, setChartData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // This would normally fetch data from an API
    setIsLoading(true)

    const fetchData = async () => {
      try {
        // Simulate API fetch
        await new Promise((resolve) => setTimeout(resolve, 500))

        let labels: string[] = []
        let predictedData: number[] = []
        let reportedData: number[] = []

        if (timePeriod === "daily") {
          labels = Array.from({ length: 7 }, (_, i) => {
            const d = new Date()
            d.setDate(d.getDate() - (6 - i))
            return d.toLocaleDateString("en-US", { weekday: "short" })
          })
          predictedData = [12, 19, 15, 22, 28, 25, 32]
          reportedData = [8, 15, 12, 17, 24, 22, 27]
        } else if (timePeriod === "weekly") {
          labels = Array.from({ length: 4 }, (_, i) => `Week ${i + 1}`)
          predictedData = [65, 82, 91, 87]
          reportedData = [55, 70, 79, 75]
        } else {
          labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
          predictedData = [65, 78, 86, 92, 95, 110, 132, 145, 150, 142, 160, 175]
          reportedData = [45, 58, 66, 78, 82, 95, 110, 125, 130, 125, 140, 155]
        }

        setChartData({
          labels,
          datasets: [
            {
              label: "Predicted Frauds",
              data: predictedData,
              borderColor: "#2563eb",
              backgroundColor: "rgba(37, 99, 235, 0.2)",
              tension: 0.3,
              fill: activeChart === "bar",
            },
            {
              label: "Reported Frauds",
              data: reportedData,
              borderColor: "#ef4444",
              backgroundColor: "rgba(239, 68, 68, 0.2)",
              tension: 0.3,
              fill: activeChart === "bar",
            },
          ],
        })
      } catch (error) {
        console.error("Failed to fetch chart data", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [activeChart, timePeriod])

  const downloadCSV = () => {
    if (!chartData) return

    // Create CSV content
    const headers = ["Period", "Predicted Frauds", "Reported Frauds"]
    const rows = chartData.labels.map((label: string, i: number) => [
      label,
      chartData.datasets[0].data[i],
      chartData.datasets[1].data[i],
    ])

    const csvContent = [headers.join(","), ...rows.map((row: any[]) => row.join(","))].join("\n")

    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `fraud-data-${timePeriod}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const chartOptions: ChartOptions<"line" | "bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 500,
    },
    interaction: {
      mode: "index",
      intersect: false,
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
        },
      },
    },
    plugins: {
      legend: {
        position: "bottom",
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        padding: 12,
        titleFont: {
          size: 14,
        },
        bodyFont: {
          size: 13,
        },
      },
    },
  }

  return (
    <div className="h-[350px]">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="space-x-1">
            <Button
              variant={activeChart === "line" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveChart("line")}
              className="h-8 w-8 p-0"
            >
              <LineChart className="h-4 w-4" />
              <span className="sr-only">Line chart</span>
            </Button>
            <Button
              variant={activeChart === "bar" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveChart("bar")}
              className="h-8 w-8 p-0"
            >
              <BarChart className="h-4 w-4" />
              <span className="sr-only">Bar chart</span>
            </Button>
          </div>
          <Select value={timePeriod} onValueChange={setTimePeriod}>
            <SelectTrigger className="w-[130px] h-8">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" size="sm" onClick={downloadCSV} disabled={!chartData || isLoading} className="h-8">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-[300px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : chartData ? (
        <div className="h-[300px]">
          {activeChart === "line" ? (
            <Line data={chartData} options={chartOptions} />
          ) : (
            <Bar data={chartData} options={chartOptions} />
          )}
        </div>
      ) : (
        <div className="flex items-center justify-center h-[300px]">
          <p>No data available</p>
        </div>
      )}
    </div>
  )
}

