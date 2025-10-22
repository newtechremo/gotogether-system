import { type NextRequest, NextResponse } from "next/server"
import { rentalQueries, deviceQueries } from "@/lib/database"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const rentalId = Number.parseInt(params.id)
    if (isNaN(rentalId)) {
      return NextResponse.json({ error: "잘못된 대여 ID입니다" }, { status: 400 })
    }

    const body = await request.json()
    const { note_return } = body

    const currentRentals = rentalQueries.getCurrentRentals()
    const rental = currentRentals.find((r) => r.id === rentalId)

    if (!rental) {
      return NextResponse.json({ error: "대여 기록을 찾을 수 없거나 이미 반납되었습니다" }, { status: 404 })
    }

    // Process return
    const returnResult = rentalQueries.returnRental(rentalId, note_return || "")

    if (returnResult.changes === 0) {
      return NextResponse.json({ error: "반납 처리에 실패했습니다" }, { status: 500 })
    }

    // Update device availability
    const updateResult = deviceQueries.updateAvailableQty(rental.device_type, 1)

    if (updateResult.changes === 0) {
      return NextResponse.json({ error: "재고 업데이트에 실패했습니다" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Return processing error:", error)
    return NextResponse.json({ error: "반납 처리에 실패했습니다" }, { status: 500 })
  }
}
