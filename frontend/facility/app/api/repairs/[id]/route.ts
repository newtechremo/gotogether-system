import { type NextRequest, NextResponse } from "next/server"
import { repairQueries } from "@/lib/database"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    const body = await request.json()
    const { status, notes } = body

    if (!status) {
      return NextResponse.json({ error: "Status is required" }, { status: 400 })
    }

    const result = repairQueries.updateStatus(id, status, notes)

    if (result.changes === 0) {
      return NextResponse.json({ error: "Repair report not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to update repair status:", error)
    return NextResponse.json({ error: "Failed to update repair status" }, { status: 500 })
  }
}
