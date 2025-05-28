import { type NextRequest, NextResponse } from "next/server"

// This would be a real database in production
const db = {
  async saveDetection(data: any) {
    console.log("Saving detection to database:", data)
    return true
  },
}

// Mock function to check rules
function checkRules(transaction: any) {
  // High amount transaction
  if (transaction.transaction_amount > 50000) {
    return {
      is_fraud: true,
      fraud_source: "rule",
      fraud_reason: "Unusually high transaction amount",
      fraud_score: 0.85,
    }
  }

  // Unusual time (3 AM)
  const txnDate = new Date(transaction.transaction_date)
  if (txnDate.getHours() >= 2 && txnDate.getHours() <= 4) {
    return {
      is_fraud: true,
      fraud_source: "rule",
      fraud_reason: "Transaction at unusual hour",
      fraud_score: 0.75,
    }
  }

  return null
}

// Mock AI model prediction
async function predictWithModel(transaction: any) {
  // In a real implementation, this would call a machine learning model
  // For demo purposes, we'll use a simple heuristic

  let score = 0.1 // Base score

  // Add to score based on various factors
  if (transaction.transaction_amount > 10000) {
    score += 0.2
  }

  if (transaction.transaction_payment_mode === "Card") {
    score += 0.1
  }

  // Random factor to simulate model variability
  score += Math.random() * 0.2

  return {
    is_fraud: score > 0.5,
    fraud_source: "model",
    fraud_reason: score > 0.5 ? "AI model detected suspicious pattern" : "",
    fraud_score: score,
  }
}

export async function POST(request: NextRequest) {
  try {
    const transaction = await request.json()

    // Validate required fields
    if (!transaction.transaction_id || !transaction.transaction_amount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // First check rules
    const ruleResult = checkRules(transaction)

    // If rule detected fraud, return immediately
    if (ruleResult && ruleResult.is_fraud) {
      // Save to database
      await db.saveDetection({
        ...transaction,
        is_fraud_predicted: true,
        fraud_source: ruleResult.fraud_source,
        fraud_reason: ruleResult.fraud_reason,
        fraud_score: ruleResult.fraud_score,
      })

      return NextResponse.json({
        transaction_id: transaction.transaction_id,
        is_fraud: true,
        fraud_source: ruleResult.fraud_source,
        fraud_reason: ruleResult.fraud_reason,
        fraud_score: ruleResult.fraud_score,
      })
    }

    // If no rule triggered, use AI model
    const modelResult = await predictWithModel(transaction)

    // Save to database
    await db.saveDetection({
      ...transaction,
      is_fraud_predicted: modelResult.is_fraud,
      fraud_source: modelResult.fraud_source,
      fraud_reason: modelResult.fraud_reason,
      fraud_score: modelResult.fraud_score,
    })

    return NextResponse.json({
      transaction_id: transaction.transaction_id,
      is_fraud: modelResult.is_fraud,
      fraud_source: modelResult.fraud_source,
      fraud_reason: modelResult.fraud_reason,
      fraud_score: modelResult.fraud_score,
    })
  } catch (error) {
    console.error("Error in fraud detection:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

