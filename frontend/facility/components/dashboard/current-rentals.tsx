"use client"
import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import type { FacilityRental } from "@/lib/api/rental.service"

interface CurrentRentalsProps {
  rentals: FacilityRental[]
}

const deviceTypeLabels: Record<string, string> = {
  "AR글라스": "AR 글라스",
  "골전도 이어폰": "골전도 이어폰",
  "스마트폰": "스마트폰",
}

export function CurrentRentals({ rentals }: CurrentRentalsProps) {
  const router = useRouter()
  const [isNavigating, setIsNavigating] = useState(false)

  const displayRentals = rentals.slice(0, 10)

  const handleReturnClick = (rental: FacilityRental) => {
    setIsNavigating(true)
    // 대여/반납 페이지의 반납 탭으로 이동, rental ID를 파라미터로 전달
    router.push(`/rentals?tab=return&rentalId=${rental.id}`)
  }

  return (
    <>
      <Card className="p-6 border-2 border-black bg-white">
        <h3 className="text-xl font-semibold text-black mb-4 leading-relaxed">현재 대여중 (최근 10건)</h3>

        {displayRentals.length === 0 ? (
          <p className="text-lg text-gray-600 text-center py-8 leading-relaxed">현재 대여중인 기기가 없습니다</p>
        ) : (
          <div className="space-y-3">
            {displayRentals.map((rental) => {
              const deviceLabels = rental.rentalDevices
                .map((device) => `${deviceTypeLabels[device.deviceType] || device.deviceType} (${device.quantity}개)`)
                .join(", ")

              return (
                <div
                  key={rental.id}
                  className="flex justify-between items-center p-4 border border-gray-300 rounded-lg bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="font-semibold text-lg text-black leading-relaxed">
                      {deviceLabels}
                    </div>
                    <div className="text-base text-gray-600 leading-relaxed">
                      {new Date(rental.rentalDate).toLocaleDateString("ko-KR")}
                    </div>
                    <div className="text-base text-gray-600 leading-relaxed">대여자: {rental.borrowerName}</div>
                  </div>
                  <div className="flex-shrink-0">
                    <Button
                      onClick={() => handleReturnClick(rental)}
                      disabled={isNavigating}
                      className="bg-black text-white hover:bg-gray-800 border-2 border-black text-sm font-semibold px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isNavigating ? "이동 중..." : "반납"}
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Card>
    </>
  )
}
