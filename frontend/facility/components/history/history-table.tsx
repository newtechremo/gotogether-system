"use client"
import { useState, useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { RentalDetailDialog } from "./rental-detail-dialog"
import type { FacilityRental } from "@/lib/api/rental.service"

interface HistoryTableProps {
  history: FacilityRental[]
}

const deviceTypeLabels: Record<string, string> = {
  "AR글라스": "AR 글라스",
  "골전도 이어폰": "골전도 이어폰",
  "스마트폰": "스마트폰",
}

const getLocalDateString = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function HistoryTable({ history }: HistoryTableProps) {
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    deviceType: "ALL",
    borrowerName: "",
  })

  const [selectedRental, setSelectedRental] = useState<FacilityRental | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  const expandedHistory = useMemo(() => {
    const events: Array<{
      id: string
      date: string
      type: "rental" | "return"
      deviceTypes: string[]
      borrowerName: string
      notes: string | null
      originalRental: FacilityRental
    }> = []

    history.forEach((rental) => {
      // Extract device types from rentalDevices array
      const deviceTypes = rental.rentalDevices.map((device) => device.deviceType)

      // Parse notes to separate rental notes from return notes
      const rentalNotes = rental.notes?.split('[반납]')[0]?.trim() || null
      const returnNotes = rental.notes?.includes('[반납]')
        ? rental.notes.split('[반납]')[1]?.trim() || null
        : null

      // Add rental event
      events.push({
        id: `${rental.id}-rent`,
        date: rental.rentalDate,
        type: "rental",
        deviceTypes,
        borrowerName: rental.borrowerName,
        notes: rentalNotes,
        originalRental: rental,
      })

      // Add return event if returned
      if (rental.actualReturnDate) {
        events.push({
          id: `${rental.id}-return`,
          date: rental.actualReturnDate,
          type: "return",
          deviceTypes,
          borrowerName: rental.borrowerName,
          notes: returnNotes,
          originalRental: rental,
        })
      }
    })

    return events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [history])

  const filteredHistory = useMemo(() => {
    return expandedHistory.filter((event) => {
      if (filters.startDate) {
        const eventDate = getLocalDateString(new Date(event.date))
        if (eventDate < filters.startDate) return false
      }
      if (filters.endDate) {
        const eventDate = getLocalDateString(new Date(event.date))
        if (eventDate > filters.endDate) return false
      }

      if (filters.deviceType !== "ALL" && !event.deviceTypes.includes(filters.deviceType)) {
        return false
      }

      if (filters.borrowerName) {
        const searchTerm = filters.borrowerName.toLowerCase()
        const nameMatch = event.borrowerName.toLowerCase().includes(searchTerm)
        const phoneMatch = event.originalRental.borrowerPhone.slice(-4).includes(searchTerm)
        const orgNameMatch = event.originalRental.organizationName?.toLowerCase().includes(searchTerm) || false
        if (!nameMatch && !phoneMatch && !orgNameMatch) return false
      }

      return true
    })
  }, [expandedHistory, filters])

  const clearFilters = () => {
    setFilters({
      startDate: "",
      endDate: "",
      deviceType: "ALL",
      borrowerName: "",
    })
  }

  const handleViewDetail = (event: (typeof expandedHistory)[0]) => {
    setSelectedRental(event.originalRental)
    setIsDetailOpen(true)
  }

  const exportToExcel = () => {
    const headers = [
      "기기 종류",
      "대여일",
      "대여요일",
      "유형",
      "단체명",
      "대여자 이름",
      "핸드폰번호",
      "성별",
      "지역",
      "거주지",
      "연령대",
      "대여목적",
      "장애유형",
      "수량",
      "반납예정일",
      "예정기간(일)",
      "대여 시 비고",
      "반납일",
      "반납 일시",
      "실제기간(일)",
      "반납 시 비고",
    ]

    // Get unique rentals from filtered history
    const uniqueRentals = new Map<number, FacilityRental>()
    filteredHistory.forEach((event) => {
      if (!uniqueRentals.has(event.originalRental.id)) {
        uniqueRentals.set(event.originalRental.id, event.originalRental)
      }
    })

    const rows = Array.from(uniqueRentals.values()).map((rental) => {
      // Calculate total quantity from rentalDevices
      const totalQuantity = rental.rentalDevices.reduce((sum, device) => sum + device.quantity, 0)

      // Get device types string
      const deviceTypes = rental.rentalDevices
        .map((device) => `${deviceTypeLabels[device.deviceType] || device.deviceType} (${device.quantity}개)`)
        .join(", ")

      // Parse notes
      const rentalNotes = rental.notes?.split('[반납]')[0]?.trim() || ""
      const returnNotes = rental.notes?.includes('[반납]')
        ? rental.notes.split('[반납]')[1]?.trim() || ""
        : ""

      // Calculate actual period if returned - normalize dates to midnight to avoid time-of-day issues
      const actualPeriod = rental.actualReturnDate && rental.rentalDate
        ? (() => {
            const rentalDateOnly = new Date(rental.rentalDate)
            rentalDateOnly.setHours(0, 0, 0, 0)
            const returnDateOnly = new Date(rental.actualReturnDate)
            returnDateOnly.setHours(0, 0, 0, 0)
            return Math.floor((returnDateOnly.getTime() - rentalDateOnly.getTime()) / (1000 * 60 * 60 * 24)) + 1
          })()
        : null

      return [
        deviceTypes,
        rental.rentalDate,
        rental.rentalWeekday || "",
        rental.rentalType,
        rental.organizationName || "",
        rental.borrowerName,
        rental.borrowerPhone,
        rental.gender,
        rental.region,
        rental.residence,
        rental.ageGroup,
        rental.rentalPurpose,
        rental.disabilityType,
        `${totalQuantity}개`,
        rental.returnDate,
        rental.rentalPeriod ? `${rental.rentalPeriod}일` : "",
        rentalNotes,
        rental.actualReturnDate || "",
        rental.actualReturnDate ? new Date(rental.actualReturnDate).toLocaleString("ko-KR") : "",
        actualPeriod ? `${actualPeriod}일` : "",
        returnNotes,
      ]
    })

    // Convert to CSV
    const csvContent = [headers.join(","), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(","))].join("\n")

    // Add BOM for proper Korean character encoding in Excel
    const BOM = "\uFEFF"
    const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" })

    // Create download link
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `대여이력_${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6">
      <Card className="p-6 border-2 border-black bg-white">
        <h2 className="text-xl font-semibold text-black mb-4 leading-relaxed">필터</h2>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="startDate" className="text-lg font-semibold text-black leading-relaxed">
                시작일
              </Label>
              <Input
                id="startDate"
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                className="mt-2 min-h-[44px] text-lg border-2 border-black"
              />
            </div>

            <div>
              <Label htmlFor="endDate" className="text-lg font-semibold text-black leading-relaxed">
                종료일
              </Label>
              <Input
                id="endDate"
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                className="mt-2 min-h-[44px] text-lg border-2 border-black"
              />
            </div>

            <div>
              <Label htmlFor="deviceType" className="text-lg font-semibold text-black leading-relaxed">
                기기 종류
              </Label>
              <Select
                value={filters.deviceType}
                onValueChange={(value) => setFilters({ ...filters, deviceType: value })}
              >
                <SelectTrigger className="mt-2 min-h-[44px] text-lg border-2 border-black">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL" className="text-lg">
                    전체
                  </SelectItem>
                  {Object.entries(deviceTypeLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value} className="text-lg">
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="borrowerName" className="text-lg font-semibold text-black leading-relaxed">
              대여자 이름, 휴대폰번호 또는 단체명 검색
            </Label>
            <Input
              id="borrowerName"
              type="text"
              value={filters.borrowerName}
              onChange={(e) => setFilters({ ...filters, borrowerName: e.target.value })}
              className="mt-2 min-h-[44px] text-lg border-2 border-black"
              placeholder="이름, 휴대폰번호 4자리 또는 단체명으로 검색"
            />
          </div>

          <div className="flex justify-between items-center pt-2">
            <p className="text-lg text-gray-600 leading-relaxed">총 {filteredHistory.length}건의 기록이 있습니다</p>
            <div className="flex gap-3">
              <Button
                onClick={exportToExcel}
                className="min-h-[44px] bg-green-600 text-white border-2 border-green-700 hover:bg-green-700 text-lg px-6 py-3 flex items-center gap-2"
              >
                <Download className="w-5 h-5" />
                엑셀 내보내기
              </Button>
              <Button
                onClick={clearFilters}
                className="min-h-[44px] bg-white text-black border-2 border-black hover:bg-gray-100 text-lg px-6 py-3"
              >
                필터 초기화
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <Card className="border-2 border-black bg-white">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-black">
                <th className="text-left p-6 text-lg font-semibold text-black leading-relaxed">일자</th>
                <th className="text-center p-6 text-lg font-semibold text-black leading-relaxed min-w-[100px]">구분</th>
                <th className="text-left p-6 text-lg font-semibold text-black leading-relaxed">기기 종류</th>
                <th className="text-left p-6 text-lg font-semibold text-black leading-relaxed">대여자</th>
                <th className="text-left p-6 text-lg font-semibold text-black leading-relaxed">유형/단체명</th>
                <th className="text-left p-6 text-lg font-semibold text-black leading-relaxed">반납예정일</th>
                <th className="text-center p-6 text-lg font-semibold text-black leading-relaxed">상세보기</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center p-12 text-lg text-gray-600 leading-relaxed">
                    조건에 맞는 기록이 없습니다
                  </td>
                </tr>
              ) : (
                filteredHistory.map((event) => (
                  <tr key={event.id} className="border-b border-gray-300 hover:bg-gray-50">
                    <td className="p-6 text-lg text-black leading-relaxed">
                      <div>{new Date(event.date).toLocaleDateString("ko-KR")}</div>
                      <div className="text-base text-gray-600">
                        {new Date(event.date).toLocaleTimeString("ko-KR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </td>
                    <td className="p-6 text-center">
                      <span
                        className={`px-3 py-2 rounded-lg text-lg font-semibold whitespace-nowrap ${
                          event.type === "rental"
                            ? "bg-blue-100 text-blue-800 border border-blue-300"
                            : "bg-green-100 text-green-800 border border-green-300"
                        }`}
                      >
                        {event.type === "rental" ? "대여" : "반납"}
                      </span>
                    </td>
                    <td className="p-6 text-lg text-black leading-relaxed">
                      <div>
                        {event.deviceTypes
                          .map((type) => deviceTypeLabels[type] || type)
                          .join(", ")}
                      </div>
                    </td>
                    <td className="p-6 text-lg text-black leading-relaxed">{event.borrowerName}</td>
                    <td className="p-6 text-lg text-black leading-relaxed">
                      <div>{event.originalRental.rentalType}</div>
                      {event.originalRental.rentalType === "단체" && event.originalRental.organizationName && (
                        <div className="text-base text-gray-600">{event.originalRental.organizationName}</div>
                      )}
                    </td>
                    <td className="p-6 text-lg text-black leading-relaxed">
                      {event.originalRental.returnDate
                        ? new Date(event.originalRental.returnDate).toLocaleDateString("ko-KR")
                        : "-"}
                    </td>
                    <td className="p-6 text-center">
                      <Button
                        onClick={() => handleViewDetail(event)}
                        className="min-h-[44px] bg-black text-white hover:bg-gray-800 border-2 border-black text-base px-4"
                      >
                        상세보기
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <RentalDetailDialog rental={selectedRental} isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} />
    </div>
  )
}
