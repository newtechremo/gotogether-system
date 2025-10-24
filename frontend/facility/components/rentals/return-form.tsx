"use client"
import { useState, useEffect } from "react"
import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import type { FacilityRental } from "@/lib/api/rental.service"
import { useReturnRental } from "@/lib/hooks/useRentals"

interface ReturnFormProps {
  currentRentals: FacilityRental[]
  preselectedRentalId?: string | null
}

const deviceTypeLabels: Record<string, string> = {
  "AR글라스": "AR 글라스",
  "골전도 이어폰": "골전도 이어폰",
  "스마트폰": "스마트폰",
}

export function ReturnForm({ currentRentals, preselectedRentalId }: ReturnFormProps) {
  const { mutate: returnRental, isPending } = useReturnRental()
  const [selectedRental, setSelectedRental] = useState<FacilityRental | null>(null)
  const [returnNotes, setReturnNotes] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [error, setError] = useState("")

  // Auto-select rental if preselectedRentalId is provided
  useEffect(() => {
    if (preselectedRentalId) {
      const rentalId = parseInt(preselectedRentalId, 10)
      const rental = currentRentals.find(r => r.id === rentalId)
      if (rental) {
        setSelectedRental(rental)
      }
    }
  }, [preselectedRentalId, currentRentals])

  // Filter rentals based on search term
  const filteredRentals = currentRentals.filter((rental) => {
    const searchLower = searchTerm.toLowerCase()
    const borrowerName = rental.borrowerName.toLowerCase()

    // Get device types from rentalDevices array
    const deviceTypes = rental.rentalDevices
      .map((device) => deviceTypeLabels[device.deviceType] || device.deviceType)
      .join(" ")
      .toLowerCase()

    return borrowerName.includes(searchLower) || deviceTypes.includes(searchLower)
  })

  const handleReturn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!selectedRental) {
      setError("반납할 대여 기록을 선택해주세요")
      return
    }

    returnRental(
      {
        id: selectedRental.id,
        data: {
          returnMemo: returnNotes || undefined,
        },
      },
      {
        onSuccess: () => {
          setSelectedRental(null)
          setReturnNotes("")
          setSearchTerm("")
        },
        onError: (err: any) => {
          setError(err.response?.data?.message || "반납 처리에 실패했습니다")
        },
      }
    )
  }

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold text-black mb-6 leading-relaxed">기기 반납</h2>

      {currentRentals.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl text-gray-600 leading-relaxed">현재 대여중인 기기가 없습니다</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="w-full">
            <Label htmlFor="search" className="text-lg font-semibold text-black leading-relaxed">
              대여 기록 검색
            </Label>
            <Input
              id="search"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mt-2 min-h-[44px] text-lg border-2 border-black w-full"
              placeholder="대여자 이름 또는 기기명으로 검색"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 max-h-96 overflow-y-auto">
            {filteredRentals.map((rental) => {
              // Group devices by type and sum quantities
              const deviceGroups = rental.rentalDevices.reduce((acc, device) => {
                const type = device.deviceType;
                if (!acc[type]) {
                  acc[type] = 0;
                }
                acc[type] += device.quantity;
                return acc;
              }, {} as Record<string, number>);

              // Create grouped device labels
              const deviceLabels = Object.entries(deviceGroups)
                .map(([type, quantity]) => `${deviceTypeLabels[type] || type} (${quantity}개)`)
                .join(", ");

              return (
                <Card
                  key={rental.id}
                  className={`p-4 cursor-pointer transition-colors border-2 ${
                    selectedRental?.id === rental.id
                      ? "border-black bg-black text-white"
                      : "border-gray-300 bg-white hover:bg-gray-50"
                  }`}
                  onClick={() => setSelectedRental(rental)}
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-semibold leading-relaxed">{deviceLabels}</span>
                      </div>
                      <div className="text-base leading-relaxed">
                        <strong>대여자:</strong> {rental.borrowerName}
                      </div>
                      <div className="text-base leading-relaxed">
                        <strong>유형:</strong> {rental.rentalType}
                        {rental.rentalType === "단체" && rental.expectedUsers && (
                          <span className="ml-2">
                            (<strong>예상 인원:</strong> {rental.expectedUsers}명)
                          </span>
                        )}
                      </div>
                      {rental.notes && (
                        <div className="text-base leading-relaxed">
                          <strong>메모:</strong> {rental.notes}
                        </div>
                      )}
                    </div>
                    <div className="text-right text-base leading-relaxed">
                      <div>대여일</div>
                      <div className="font-semibold">
                        {new Date(rental.rentalDate).toLocaleDateString("ko-KR")}
                      </div>
                      <div className="mt-2 text-sm">반납 예정</div>
                      <div className="font-semibold text-sm">
                        {new Date(rental.returnDate).toLocaleDateString("ko-KR")}
                      </div>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>

          {selectedRental && (
            <form onSubmit={handleReturn} className="space-y-6 pt-6 border-t-2 border-black">
              <div>
                <Label htmlFor="returnNotes" className="text-lg font-semibold text-black leading-relaxed">
                  반납 비고 (상태, 분실/파손 등)
                </Label>
                <Textarea
                  id="returnNotes"
                  value={returnNotes}
                  onChange={(e) => setReturnNotes(e.target.value)}
                  className="mt-2 min-h-[88px] text-lg border-2 border-black resize-none"
                  placeholder="기기 상태, 분실/파손 여부, 기타 특이사항을 입력하세요"
                />
              </div>

              {error && (
                <div className="p-4 bg-red-100 border-2 border-red-600 rounded-lg">
                  <p className="text-lg text-red-800 leading-relaxed">{error}</p>
                </div>
              )}

              <div className="flex gap-4">
                <Button
                  type="button"
                  onClick={() => setSelectedRental(null)}
                  className="flex-1 min-h-[60px] bg-white text-black border-2 border-black hover:bg-gray-100 text-xl font-semibold"
                >
                  선택 취소
                </Button>
                <Button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 min-h-[60px] bg-black text-white hover:bg-gray-800 border-2 border-black text-xl font-semibold"
                >
                  {isPending ? "반납 처리 중..." : "반납 완료"}
                </Button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  )
}
