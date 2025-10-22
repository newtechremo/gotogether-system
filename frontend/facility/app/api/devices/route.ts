import { type NextRequest, NextResponse } from "next/server"
import { deviceQueries } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, name, qty_total, qty_available } = body

    if (!type || typeof qty_total !== "number" || typeof qty_available !== "number") {
      return NextResponse.json({ error: "필수 필드가 누락되었습니다" }, { status: 400 })
    }

    const result = deviceQueries.create({
      type,
      name,
      qty_total,
      qty_available,
    })

    return NextResponse.json({ success: true, id: result.lastInsertRowid })
  } catch (error) {
    console.error("Device creation error:", error)
    return NextResponse.json({ error: "기기 등록에 실패했습니다" }, { status: 500 })
  }
}
