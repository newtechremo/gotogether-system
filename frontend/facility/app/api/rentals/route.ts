import { type NextRequest, NextResponse } from "next/server"
import { rentalQueries, deviceQueries } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      device_type,
      device_name,
      renter_name,
      renter_phone,
      rental_date,
      rental_day_of_week,
      rental_type,
      group_name,
      gender,
      region,
      residence,
      age_group,
      rental_purpose,
      disability_type,
      quantity,
      period,
      total_person_days,
      return_date,
      note_rent,
    } = body

    if (
      !device_type ||
      !renter_name ||
      !renter_phone ||
      !rental_date ||
      !rental_type ||
      !gender ||
      !region ||
      !residence ||
      !age_group ||
      !rental_purpose ||
      !disability_type ||
      !return_date
    ) {
      return NextResponse.json({ error: "필수 항목이 누락되었습니다" }, { status: 400 })
    }

    // Check if devices are available
    const availableDevices = deviceQueries
      .getAll()
      .filter((device) => device.type === device_type && device.qty_available > 0)

    if (availableDevices.length === 0) {
      return NextResponse.json({ error: "대여 가능한 기기가 없습니다" }, { status: 400 })
    }

    const rentalResult = rentalQueries.create({
      device_type,
      device_name,
      renter_name,
      renter_phone,
      rental_date,
      rental_day_of_week,
      rental_type,
      group_name,
      gender,
      region,
      residence,
      age_group,
      rental_purpose,
      disability_type,
      quantity,
      period,
      total_person_days,
      return_date,
      note_rent,
    })

    // Update device availability
    const updateResult = deviceQueries.updateAvailableQty(device_type, -quantity)

    if (updateResult.changes === 0) {
      return NextResponse.json({ error: "재고 업데이트에 실패했습니다" }, { status: 500 })
    }

    return NextResponse.json({ success: true, id: rentalResult.lastInsertRowid })
  } catch (error) {
    console.error("Rental creation error:", error)
    return NextResponse.json({ error: "대여 처리에 실패했습니다" }, { status: 500 })
  }
}
