import { NextResponse, type NextRequest } from "next/server"

// In-memory rules database for demo
// In a real application, this would be in a proper database
const rules = [
  {
    id: "rule1",
    name: "High Amount Transaction",
    condition: "transaction_amount > 50000",
    active: true,
    description: "Flag transactions with unusually high amounts",
    ruleType: "transaction_amount",
  },
  {
    id: "rule2",
    name: "Unusual Spending Pattern",
    condition: "transaction_amount > avg_user_transaction * 5",
    active: true,
    description: "Flag transactions that are 5x higher than user average",
    ruleType: "transaction_amount",
  },
  {
    id: "rule3",
    name: "Location Mismatch",
    condition: "user_country != transaction_country",
    active: true,
    description: "Flag transactions where user country differs from transaction country",
    ruleType: "location_device",
  },
  {
    id: "rule4",
    name: "New Device",
    condition: "is_new_device == true && transaction_amount > 10000",
    active: true,
    description: "Flag high-value transactions from new devices",
    ruleType: "location_device",
  },
  {
    id: "rule5",
    name: "Rapid Transactions",
    condition: "transactions_count_last_hour > 5",
    active: true,
    description: "Flag accounts with more than 5 transactions in the last hour",
    ruleType: "transaction_frequency",
  },
  {
    id: "rule6",
    name: "Multiple Failed Attempts",
    condition: "failed_transactions_count_last_day > 3",
    active: true,
    description: "Flag accounts with more than 3 failed transactions in the last day",
    ruleType: "transaction_frequency",
  },
]

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const ruleType = searchParams.get("type")

  if (ruleType) {
    const filteredRules = rules.filter((rule) => rule.ruleType === ruleType)
    return NextResponse.json(filteredRules)
  }

  return NextResponse.json(rules)
}

export async function POST(request: NextRequest) {
  try {
    const newRule = await request.json()

    if (!newRule.name || !newRule.condition || !newRule.ruleType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const id = newRule.id || `rule${Date.now()}`
    const rule = {
      id,
      name: newRule.name,
      condition: newRule.condition,
      description: newRule.description || "",
      active: newRule.active !== undefined ? newRule.active : true,
      ruleType: newRule.ruleType,
    }

    rules.push(rule)

    return NextResponse.json(rule, { status: 201 })
  } catch (error) {
    console.error("Error creating rule:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

