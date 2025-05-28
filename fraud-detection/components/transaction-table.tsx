"use client"
import { useState, useEffect } from "react"
import { Download, Filter, MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { toast } from "@/components/ui/use-toast"

interface TransactionTableProps {
  searchQuery: string
  dateRange: { from: Date; to: Date }
}

// Transaction interface
interface Transaction {
  transaction_id: string
  transaction_date: string
  transaction_amount: number
  transaction_channel: string
  transaction_payment_mode: string
  payment_gateway_bank: string
  payer_email: string
  payer_mobile: string
  payer_card_brand: string
  payer_device: string
  payer_browser: string
  payee_id: string
  is_fraud_predicted: boolean
  is_fraud_reported: boolean
}

export function TransactionTable({ searchQuery, dateRange }: TransactionTableProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [setSearchQuery] = useState<string>("")

  // Filter state
  const [filters, setFilters] = useState({
    channel: "",
    paymentMode: "",
    minAmount: "",
    maxAmount: "",
    isReported: false,
    isPredicted: false,
  })

  // Mock data - in a real app, this would come from an API
  const mockTransactions = [
    {
      transaction_id: "txn_12345",
      transaction_date: "2025-03-21T13:45:00Z",
      transaction_amount: 5000,
      transaction_channel: "web",
      transaction_payment_mode: "Card",
      payment_gateway_bank: "Example Bank",
      payer_email: "user@example.com",
      payer_mobile: "1234567890",
      payer_card_brand: "Visa",
      payer_device: "device_id_123",
      payer_browser: "Chrome",
      payee_id: "payee_123",
      is_fraud_predicted: false,
      is_fraud_reported: false,
    },
    {
      transaction_id: "txn_12346",
      transaction_date: "2025-03-21T14:30:00Z",
      transaction_amount: 75000,
      transaction_channel: "mobile",
      transaction_payment_mode: "UPI",
      payment_gateway_bank: "Example Bank",
      payer_email: "user2@example.com",
      payer_mobile: "9876543210",
      payer_card_brand: "",
      payer_device: "device_id_456",
      payer_browser: "",
      payee_id: "payee_456",
      is_fraud_predicted: true,
      is_fraud_reported: true,
    },
    {
      transaction_id: "txn_12347",
      transaction_date: "2025-03-21T15:15:00Z",
      transaction_amount: 12500,
      transaction_channel: "web",
      transaction_payment_mode: "Card",
      payment_gateway_bank: "Another Bank",
      payer_email: "user3@example.com",
      payer_mobile: "5555555555",
      payer_card_brand: "Mastercard",
      payer_device: "device_id_789",
      payer_browser: "Firefox",
      payee_id: "payee_789",
      is_fraud_predicted: true,
      is_fraud_reported: false,
    },
    {
      transaction_id: "txn_12348",
      transaction_date: "2025-03-21T16:00:00Z",
      transaction_amount: 3000,
      transaction_channel: "mobile",
      transaction_payment_mode: "NEFT",
      payment_gateway_bank: "Third Bank",
      payer_email: "user4@example.com",
      payer_mobile: "1111111111",
      payer_card_brand: "",
      payer_device: "device_id_101",
      payer_browser: "",
      payee_id: "payee_101",
      is_fraud_predicted: false,
      is_fraud_reported: false,
    },
    {
      transaction_id: "txn_12349",
      transaction_date: "2025-03-21T16:45:00Z",
      transaction_amount: 50000,
      transaction_channel: "web",
      transaction_payment_mode: "Card",
      payment_gateway_bank: "Example Bank",
      payer_email: "user5@example.com",
      payer_mobile: "2222222222",
      payer_card_brand: "Visa",
      payer_device: "device_id_202",
      payer_browser: "Chrome",
      payee_id: "payee_202",
      is_fraud_predicted: true,
      is_fraud_reported: true,
    },
    {
      transaction_id: "txn_12350",
      transaction_date: "2025-03-21T17:30:00Z",
      transaction_amount: 8500,
      transaction_channel: "api",
      transaction_payment_mode: "Card",
      payment_gateway_bank: "Fourth Bank",
      payer_email: "user6@example.com",
      payer_mobile: "3333333333",
      payer_card_brand: "Mastercard",
      payer_device: "device_id_303",
      payer_browser: "",
      payee_id: "payee_303",
      is_fraud_predicted: false,
      is_fraud_reported: false,
    },
    {
      transaction_id: "txn_12351",
      transaction_date: "2025-03-22T09:15:00Z",
      transaction_amount: 120000,
      transaction_channel: "web",
      transaction_payment_mode: "RTGS",
      payment_gateway_bank: "Fifth Bank",
      payer_email: "user7@example.com",
      payer_mobile: "4444444444",
      payer_card_brand: "",
      payer_device: "device_id_404",
      payer_browser: "Safari",
      payee_id: "payee_404",
      is_fraud_predicted: true,
      is_fraud_reported: false,
    },
    {
      transaction_id: "txn_12352",
      transaction_date: "2025-03-22T10:00:00Z",
      transaction_amount: 2000,
      transaction_channel: "mobile",
      transaction_payment_mode: "UPI",
      payment_gateway_bank: "Sixth Bank",
      payer_email: "user8@example.com",
      payer_mobile: "5555555555",
      payer_card_brand: "",
      payer_device: "device_id_505",
      payer_browser: "",
      payee_id: "payee_505",
      is_fraud_predicted: false,
      is_fraud_reported: false,
    },
  ]

  useEffect(() => {
    const fetchTransactions = async () => {
      setIsLoading(true)
      try {
        // Simulate API call with a delay
        await new Promise((resolve) => setTimeout(resolve, 500))

        // Generate more transactions for pagination
        const generatedTransactions = [...mockTransactions]
        for (let i = 0; i < 20; i++) {
          generatedTransactions.push({
            ...mockTransactions[i % mockTransactions.length],
            transaction_id: `txn_${12352 + i + 1}`,
            transaction_date: new Date(
              new Date().setDate(new Date().getDate() - Math.floor(Math.random() * 30)),
            ).toISOString(),
            transaction_amount: Math.floor(Math.random() * 100000) + 1000,
          })
        }

        setTransactions(generatedTransactions)
      } catch (error) {
        console.error("Error fetching transactions:", error)
        toast({
          title: "Error",
          description: "Failed to fetch transactions data",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchTransactions()
  }, [])

  // Apply search and filters
  useEffect(() => {
    let filtered = [...transactions]

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (transaction) =>
          transaction.transaction_id.toLowerCase().includes(query) ||
          transaction.payer_email.toLowerCase().includes(query) ||
          transaction.payee_id.toLowerCase().includes(query),
      )
    }

    // Apply date filter
    filtered = filtered.filter((transaction) => {
      const txnDate = new Date(transaction.transaction_date)
      return txnDate >= dateRange.from && txnDate <= dateRange.to
    })

    // Apply additional filters
    if (filters.channel) {
      filtered = filtered.filter((txn) => txn.transaction_channel === filters.channel)
    }

    if (filters.paymentMode) {
      filtered = filtered.filter((txn) => txn.transaction_payment_mode === filters.paymentMode)
    }

    if (filters.minAmount) {
      filtered = filtered.filter((txn) => txn.transaction_amount >= Number(filters.minAmount))
    }

    if (filters.maxAmount) {
      filtered = filtered.filter((txn) => txn.transaction_amount <= Number(filters.maxAmount))
    }

    if (filters.isPredicted) {
      filtered = filtered.filter((txn) => txn.is_fraud_predicted)
    }

    if (filters.isReported) {
      filtered = filtered.filter((txn) => txn.is_fraud_reported)
    }

    setFilteredTransactions(filtered)
    setTotalPages(Math.max(1, Math.ceil(filtered.length / 10)))
    setPage(1) // Reset to first page when filters change
  }, [searchQuery, dateRange, transactions, filters])

  const handleReportAsFraud = async (transactionId: string) => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Update the transaction status
      setTransactions((prev) =>
        prev.map((txn) => {
          if (txn.transaction_id === transactionId) {
            return { ...txn, is_fraud_reported: true }
          }
          return txn
        }),
      )

      toast({
        title: "Success",
        description: `Transaction ${transactionId} reported as fraud`,
      })
    } catch (error) {
      console.error("Error reporting fraud:", error)
      toast({
        title: "Error",
        description: "Failed to report transaction as fraud",
        variant: "destructive",
      })
    }
  }

  const handleMarkAsLegitimate = async (transactionId: string) => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Update the transaction status
      setTransactions((prev) =>
        prev.map((txn) => {
          if (txn.transaction_id === transactionId) {
            return { ...txn, is_fraud_reported: false }
          }
          return txn
        }),
      )

      toast({
        title: "Success",
        description: `Transaction ${transactionId} marked as legitimate`,
      })
    } catch (error) {
      console.error("Error marking as legitimate:", error)
      toast({
        title: "Error",
        description: "Failed to mark transaction as legitimate",
        variant: "destructive",
      })
    }
  }

  const resetFilters = () => {
    setFilters({
      channel: "",
      paymentMode: "",
      minAmount: "",
      maxAmount: "",
      isReported: false,
      isPredicted: false,
    })
  }

  const applyFilters = () => {
    setIsFilterOpen(false)
  }

  const downloadTransactionsCSV = () => {
    // Create CSV content
    const headers = [
      "Transaction ID",
      "Date",
      "Amount",
      "Channel",
      "Payment Mode",
      "Payer Email",
      "Payee ID",
      "Predicted Fraud",
      "Reported Fraud",
    ]

    const rows = filteredTransactions.map((txn) => [
      txn.transaction_id,
      new Date(txn.transaction_date).toLocaleString(),
      txn.transaction_amount,
      txn.transaction_channel,
      txn.transaction_payment_mode,
      txn.payer_email,
      txn.payee_id,
      txn.is_fraud_predicted ? "Yes" : "No",
      txn.is_fraud_reported ? "Yes" : "No",
    ])

    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n")

    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", "transactions.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Get current page of transactions
  const currentTransactions = filteredTransactions.slice((page - 1) * 10, page * 10)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-1 items-center space-x-2">
          <Input
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 w-[150px] lg:w-[250px]"
          />
          <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-1">
                <Filter className="h-3.5 w-3.5" />
                <span>Filter</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Filter Transactions</DialogTitle>
                <DialogDescription>Apply filters to find specific transactions</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="channel">Channel</Label>
                    <Select
                      value={filters.channel}
                      onValueChange={(value) => setFilters({ ...filters, channel: value })}
                    >
                      <SelectTrigger id="channel">
                        <SelectValue placeholder="Any channel" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any channel</SelectItem>
                        <SelectItem value="web">Web</SelectItem>
                        <SelectItem value="mobile">Mobile</SelectItem>
                        <SelectItem value="api">API</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="paymentMode">Payment Mode</Label>
                    <Select
                      value={filters.paymentMode}
                      onValueChange={(value) => setFilters({ ...filters, paymentMode: value })}
                    >
                      <SelectTrigger id="paymentMode">
                        <SelectValue placeholder="Any payment mode" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any payment mode</SelectItem>
                        <SelectItem value="Card">Card</SelectItem>
                        <SelectItem value="UPI">UPI</SelectItem>
                        <SelectItem value="NEFT">NEFT</SelectItem>
                        <SelectItem value="RTGS">RTGS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="minAmount">Min Amount</Label>
                    <Input
                      id="minAmount"
                      type="number"
                      placeholder="0"
                      value={filters.minAmount}
                      onChange={(e) => setFilters({ ...filters, minAmount: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxAmount">Max Amount</Label>
                    <Input
                      id="maxAmount"
                      type="number"
                      placeholder="Any"
                      value={filters.maxAmount}
                      onChange={(e) => setFilters({ ...filters, maxAmount: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Fraud Status</Label>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="isPredicted"
                        checked={filters.isPredicted}
                        onCheckedChange={(checked) => setFilters({ ...filters, isPredicted: Boolean(checked) })}
                      />
                      <label
                        htmlFor="isPredicted"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Predicted Fraud
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="isReported"
                        checked={filters.isReported}
                        onCheckedChange={(checked) => setFilters({ ...filters, isReported: Boolean(checked) })}
                      />
                      <label
                        htmlFor="isReported"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Reported Fraud
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={resetFilters}>
                  Reset
                </Button>
                <Button onClick={applyFilters}>Apply Filters</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button variant="outline" size="sm" className="h-8" onClick={downloadTransactionsCSV}>
            <Download className="h-3.5 w-3.5 mr-1" />
            Export
          </Button>
        </div>
        <div className="text-sm text-muted-foreground">{filteredTransactions.length} transactions found</div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Transaction ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Channel</TableHead>
              <TableHead>Payment Mode</TableHead>
              <TableHead>Payer Email</TableHead>
              <TableHead>Payee ID</TableHead>
              <TableHead>Predicted Fraud</TableHead>
              <TableHead>Reported Fraud</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={10} className="h-24 text-center">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                </TableCell>
              </TableRow>
            ) : currentTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="h-24 text-center">
                  No transactions found.
                </TableCell>
              </TableRow>
            ) : (
              currentTransactions.map((transaction) => (
                <TableRow key={transaction.transaction_id}>
                  <TableCell className="font-medium">{transaction.transaction_id}</TableCell>
                  <TableCell>{new Date(transaction.transaction_date).toLocaleString()}</TableCell>
                  <TableCell>₹{transaction.transaction_amount.toLocaleString()}</TableCell>
                  <TableCell className="capitalize">{transaction.transaction_channel}</TableCell>
                  <TableCell>{transaction.transaction_payment_mode}</TableCell>
                  <TableCell>{transaction.payer_email}</TableCell>
                  <TableCell>{transaction.payee_id}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        transaction.is_fraud_predicted ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                      }`}
                    >
                      {transaction.is_fraud_predicted ? "Yes" : "No"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        transaction.is_fraud_reported ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                      }`}
                    >
                      {transaction.is_fraud_reported ? "Yes" : "No"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() => {
                            // Display transaction details in toast
                            toast({
                              title: `Transaction: ${transaction.transaction_id}`,
                              description: (
                                <div className="mt-2 space-y-1 text-xs">
                                  <p>Amount: ₹{transaction.transaction_amount.toLocaleString()}</p>
                                  <p>Date: {new Date(transaction.transaction_date).toLocaleString()}</p>
                                  <p>Channel: {transaction.transaction_channel}</p>
                                  <p>Payment: {transaction.transaction_payment_mode}</p>
                                  <p>Bank: {transaction.payment_gateway_bank}</p>
                                  <p>Email: {transaction.payer_email}</p>
                                </div>
                              ),
                            })
                          }}
                        >
                          View details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleReportAsFraud(transaction.transaction_id)}
                          disabled={transaction.is_fraud_reported}
                        >
                          Report as fraud
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleMarkAsLegitimate(transaction.transaction_id)}
                          disabled={!transaction.is_fraud_reported}
                        >
                          Mark as legitimate
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious onClick={() => setPage((prev) => Math.max(1, prev - 1))} disabled={page === 1} />
            </PaginationItem>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              // Show pages around current page
              let pageNum = page
              if (page <= 3) {
                pageNum = i + 1
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i
              } else {
                pageNum = page - 2 + i
              }

              if (pageNum <= 0 || pageNum > totalPages) return null

              return (
                <PaginationItem key={pageNum}>
                  <PaginationLink isActive={page === pageNum} onClick={() => setPage(pageNum)}>
                    {pageNum}
                  </PaginationLink>
                </PaginationItem>
              )
            })}
            <PaginationItem>
              <PaginationNext
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={page === totalPages}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  )
}

