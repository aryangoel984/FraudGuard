import { NextResponse, type NextRequest } from "next/server"

// Accessing the in-memory rules
// In a real application, this would use a shared database
import { rules } from "../../shared"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { active } = await request.json()
    const index = rules.findIndex((r) => r.id === params.id)

    if (index === -1) {
      return NextResponse.json({ error: "Rule not found" }, { status: 404 })
    }

    if (active === undefined) {
      return NextResponse.json({ error: "Missing active status" }, { status: 400 })
    }

    // Update the rule's active status
    rules[index].active = active

    return NextResponse.json(rules[index])
  } catch (error) {
    console.error("Error toggling rule:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

