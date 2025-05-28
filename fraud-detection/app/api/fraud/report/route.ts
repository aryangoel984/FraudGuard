import { type NextRequest, NextResponse } from "next/server"

// This would be a real database in production
const db = {
  async saveReport(data: any) {
    console.log("Saving fraud report to database:", data)
    return true
  },
  async getTransaction(id: string) {
    // Mock implementation
    return { transaction_id: id, exists: true }
  },
}

export async function POST(request: NextRequest) {
  try {
    const report = await request.json()

    // Validate required fields
    if (!report.transaction_id || !report.reporting_entity_id) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if transaction exists
    const transaction = await db.getTransaction(report.transaction_id)
    if (!transaction.exists) {
      return NextResponse.json(
        {
          transaction_id: report.transaction_id,
          reporting_acknowledged: false,
          failure_code: 404, // Transaction not found
        },
        { status: 404 },
      )
    }

    // Save the report to database
    await db.saveReport({
      transaction_id: report.transaction_id,
      reporting_entity_id: report.reporting_entity_id,
      fraud_details: report.fraud_details || "",
      reported_at: new Date().toISOString(),
      is_fraud_reported: true,
    })

    return NextResponse.json({
      transaction_id: report.transaction_id,
      reporting_acknowledged: true,
      failure_code: 0,
    })
  } catch (error) {
    console.error("Error in fraud reporting:", error)
    return NextResponse.json(
      {
        transaction_id: "unknown",
        reporting_acknowledged: false,
        failure_code: 500, // Internal server error
      },
      { status: 500 },
    )
  }
}

