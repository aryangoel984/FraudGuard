import { NextResponse, type NextRequest } from "next/server"

// Accessing the in-memory rules
// In a real application, this would use a shared database
// This is a simplified example for demonstration
import { rules } from "../shared"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const rule = rules.find((r) => r.id === params.id)

  if (!rule) {
    return NextResponse.json({ error: "Rule not found" }, { status: 404 })
  }

  return NextResponse.json(rule)
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const updatedRule = await request.json()
    const index = rules.findIndex((r) => r.id === params.id)

    if (index === -1) {
      return NextResponse.json({ error: "Rule not found" }, { status: 404 })
    }

    // Update the rule
    rules[index] = { ...rules[index], ...updatedRule }

    return NextResponse.json(rules[index])
  } catch (error) {
    console.error("Error updating rule:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const index = rules.findIndex((r) => r.id === params.id)

  if (index === -1) {
    return NextResponse.json({ error: "Rule not found" }, { status: 404 })
  }

  // Remove the rule
  const deletedRule = rules.splice(index, 1)[0]

  return NextResponse.json(deletedRule)
}

