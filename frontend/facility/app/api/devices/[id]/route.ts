import { type NextRequest, NextResponse } from "next/server"
import { deviceQueries } from "@/lib/database"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const deviceId = Number.parseInt(params.id)
    if (isNaN(deviceId)) {
      return NextResponse.json({ error: "잘못된 기기 ID입니다" }, { status: 400 })
    }

    const body = await request.json()
    const { name, qty_total, qty_available, reason } = body

    if (!reason) {
      return NextResponse.json({ error: "수정 사유는 필수입니다" }, { status: 400 })
    }

    const updates: any = {}
    if (name !== undefined) updates.name = name
    if (typeof qty_total === "number") updates.qty_total = qty_total
    if (typeof qty_available === "number") updates.qty_available = qty_available

    const result = deviceQueries.update(deviceId, updates)

    if (result.changes === 0) {
      return NextResponse.json({ error: "기기를 찾을 수 없습니다" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Device update error:", error)
    return NextResponse.json({ error: "기기 수정에 실패했습니다" }, { status: 500 })
  }
}
