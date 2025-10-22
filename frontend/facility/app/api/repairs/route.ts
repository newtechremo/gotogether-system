import { type NextRequest, NextResponse } from "next/server"
import { repairQueries } from "@/lib/database"

export async function GET() {
  try {
    const repairs = repairQueries.getAll()
    return NextResponse.json(repairs)
  } catch (error) {
    console.error("Failed to fetch repairs:", error)
    return NextResponse.json({ error: "Failed to fetch repairs" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { device_type, device_name, symptom, status } = body

    if (!device_type || !symptom) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const result = repairQueries.create({
      device_type,
      device_name,
      symptom,
      status: status || "REPORTED",
      notes: null,
    })

    return NextResponse.json({ id: result.lastInsertRowid }, { status: 201 })
  } catch (error) {
    console.error("Failed to create repair report:", error)
    return NextResponse.json({ error: "Failed to create repair report" }, { status: 500 })
  }
}
