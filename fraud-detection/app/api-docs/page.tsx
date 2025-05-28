import { Check, Copy } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"

export default function ApiDocsPage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="API Documentation"
        description="Documentation for the Fraud Detection, Alert, and Monitoring APIs."
      />
      <Tabs defaultValue="realtime" className="space-y-4">
        <TabsList>
          <TabsTrigger value="realtime">Real-time API</TabsTrigger>
          <TabsTrigger value="batch">Batch API</TabsTrigger>
          <TabsTrigger value="reporting">Reporting API</TabsTrigger>
        </TabsList>
        <TabsContent value="realtime" className="space-y-4">
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="flex flex-col space-y-1.5 p-6">
              <h3 className="text-2xl font-semibold leading-none tracking-tight">Real-time Fraud Detection API</h3>
              <p className="text-sm text-muted-foreground">
                Process a single transaction and get fraud detection results in real-time.
              </p>
            </div>
            <div className="p-6 pt-0">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium">Endpoint</h4>
                  <div className="mt-1 flex items-center space-x-2 rounded-md bg-muted p-2">
                    <code className="text-sm">POST /api/fraud/detect</code>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Copy className="h-4 w-4" />
                      <span className="sr-only">Copy</span>
                    </Button>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Request Body</h4>
                  <div className="mt-1 rounded-md bg-muted p-2">
                    <pre className="text-sm">
                      {`{
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
}`}
                    </pre>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Response</h4>
                  <div className="mt-1 rounded-md bg-muted p-2">
                    <pre className="text-sm">
                      {`{
  "transaction_id": "txn_12345",
  "is_fraud": false,
  "fraud_source": "rule",
  "fraud_reason": "",
  "fraud_score": 0.15
}`}
                    </pre>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Response Codes</h4>
                  <ul className="mt-2 list-inside space-y-1 text-sm">
                    <li className="flex items-center">
                      <Check className="mr-2 h-4 w-4 text-green-500" />
                      <span>200 - Success</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="mr-2 h-4 w-4 text-amber-500" />
                      <span>400 - Bad Request (Invalid input)</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="mr-2 h-4 w-4 text-amber-500" />
                      <span>500 - Server Error</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="batch" className="space-y-4">
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="flex flex-col space-y-1.5 p-6">
              <h3 className="text-2xl font-semibold leading-none tracking-tight">Batch Fraud Detection API</h3>
              <p className="text-sm text-muted-foreground">Process multiple transactions in a single request.</p>
            </div>
            <div className="p-6 pt-0">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium">Endpoint</h4>
                  <div className="mt-1 flex items-center space-x-2 rounded-md bg-muted p-2">
                    <code className="text-sm">POST /api/fraud/detect/batch</code>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Copy className="h-4 w-4" />
                      <span className="sr-only">Copy</span>
                    </Button>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Request Body</h4>
                  <div className="mt-1 rounded-md bg-muted p-2">
                    <pre className="text-sm">
                      {`{
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
    },
    {
      "transaction_id": "txn_12346",
      "transaction_amount": 75000,
      "transaction_date": "2025-03-21T13:46:00Z",
      "transaction_channel": "mobile",
      "transaction_payment_mode": "UPI",
      "payment_gateway_bank": "Example Bank",
      "payer_email": "user2@example.com",
      "payer_mobile": "9876543210",
      "payer_card_brand": "",
      "payer_device": "device_id_456",
      "payer_browser": "",
      "payee_id": "payee_456"
    }
  ]
}`}
                    </pre>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Response</h4>
                  <div className="mt-1 rounded-md bg-muted p-2">
                    <pre className="text-sm">
                      {`{
  "txn_12345": {
    "is_fraud": false,
    "fraud_reason": "",
    "fraud_score": 0.15
  },
  "txn_12346": {
    "is_fraud": true,
    "fraud_reason": "Unusually high transaction amount",
    "fraud_score": 0.85
  }
}`}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="reporting" className="space-y-4">
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="flex flex-col space-y-1.5 p-6">
              <h3 className="text-2xl font-semibold leading-none tracking-tight">Fraud Reporting API</h3>
              <p className="text-sm text-muted-foreground">Report a transaction as fraudulent.</p>
            </div>
            <div className="p-6 pt-0">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium">Endpoint</h4>
                  <div className="mt-1 flex items-center space-x-2 rounded-md bg-muted p-2">
                    <code className="text-sm">POST /api/fraud/report</code>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Copy className="h-4 w-4" />
                      <span className="sr-only">Copy</span>
                    </Button>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Request Body</h4>
                  <div className="mt-1 rounded-md bg-muted p-2">
                    <pre className="text-sm">
                      {`{
  "transaction_id": "txn_12345",
  "reporting_entity_id": "entity_123",
  "fraud_details": "Unauthorized transaction reported by customer"
}`}
                    </pre>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Response</h4>
                  <div className="mt-1 rounded-md bg-muted p-2">
                    <pre className="text-sm">
                      {`{
  "transaction_id": "txn_12345",
  "reporting_acknowledged": true,
  "failure_code": 0
}`}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </DashboardShell>
  )
}

