import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { transactions } = await request.json()

    if (!transactions || !Array.isArray(transactions)) {
      return NextResponse.json({ error: "Invalid input: transactions must be an array" }, { status: 400 })
    }

    // Process transactions in parallel
    const results = await Promise.all(
      transactions.map(async (transaction) => {
        // Call the real-time API for each transaction
        const response = await fetch(new URL("/api/fraud/detect", request.url), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(transaction),
        })

        if (!response.ok) {
          throw new Error(`Failed to process transaction ${transaction.transaction_id}`)
        }

        const result = await response.json()
        return { id: transaction.transaction_id, result }
      }),
    )

    // Format the response
    const formattedResults: Record<string, any> = {}
    results.forEach((item) => {
      formattedResults[item.id] = {
        is_fraud: item.result.is_fraud,
        fraud_reason: item.result.fraud_reason,
        fraud_score: item.result.fraud_score,
      }
    })

    return NextResponse.json(formattedResults)
  } catch (error) {
    console.error("Error in batch fraud detection:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

