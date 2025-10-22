"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { FacilityRental } from "@/lib/api/rental.service"

interface RentalDetailDialogProps {
  rental: FacilityRental | null
  isOpen: boolean
  onClose: () => void
}

const deviceTypeLabels: Record<string, string> = {
  "AR글라스": "AR 글라스",
  "골전도 이어폰": "골전도 이어폰",
  "스마트폰": "스마트폰",
}

export function RentalDetailDialog({ rental, isOpen, onClose }: RentalDetailDialogProps) {
  if (!rental) return null

  // Calculate total quantity from rentalDevices
  const totalQuantity = rental.rentalDevices.reduce((sum, device) => sum + device.quantity, 0)

  // Get device types string
  const deviceTypesDisplay = rental.rentalDevices
    .map((device) => `${deviceTypeLabels[device.deviceType] || device.deviceType} (${device.quantity}개)`)
    .join(", ")

  // Parse notes to separate rental notes from return notes
  const rentalNotes = rental.notes?.split('[반납]')[0]?.trim() || null
  const returnNotes = rental.notes?.includes('[반납]')
    ? rental.notes.split('[반납]')[1]?.trim() || null
    : null

  // Calculate expected person-days
  const expectedPersonDays = rental.rentalPeriod ? rental.rentalPeriod * totalQuantity : null

  const isReturned = !!rental.actualReturnDate

  // Calculate actual period - normalize dates to midnight to avoid time-of-day issues
  const actualPeriod = isReturned && rental.actualReturnDate && rental.rentalDate
    ? (() => {
        const rentalDateOnly = new Date(rental.rentalDate)
        rentalDateOnly.setHours(0, 0, 0, 0)
        const returnDateOnly = new Date(rental.actualReturnDate)
        returnDateOnly.setHours(0, 0, 0, 0)
        return Math.floor((returnDateOnly.getTime() - rentalDateOnly.getTime()) / (1000 * 60 * 60 * 24)) + 1
      })()
    : null
  const actualPersonDays = actualPeriod ? actualPeriod * totalQuantity : null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto border-2 border-black">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-black leading-relaxed">
            {isReturned ? "대여/반납 상세정보" : "대여 상세정보"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* 대여 정보 섹션 */}
          <div className="border-2 border-black p-6 rounded-lg bg-blue-50">
            <h3 className="text-xl font-bold text-black mb-4 leading-relaxed">대여 정보</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DetailItem label="기기 종류" value={deviceTypesDisplay} fullWidth />
              <DetailItem label="대여일" value={rental.rentalDate} />
              <DetailItem label="대여요일" value={rental.rentalWeekday || "-"} />
              <DetailItem label="유형" value={rental.rentalType} />
              {rental.organizationName && <DetailItem label="단체명" value={rental.organizationName} />}
              <DetailItem label="대여자 이름" value={rental.borrowerName} />
              <DetailItem label="핸드폰번호" value={rental.borrowerPhone} />
              <DetailItem label="성별" value={rental.gender} />
              <DetailItem label="지역" value={rental.region} />
              <DetailItem label="거주지" value={rental.residence} />
              <DetailItem label="연령대" value={rental.ageGroup} />
              <DetailItem label="대여목적" value={rental.rentalPurpose} />
              <DetailItem label="장애유형" value={rental.disabilityType} />
              <DetailItem label="수량" value={`${totalQuantity}개`} />
              <DetailItem label="반납예정일" value={rental.returnDate} />
              <DetailItem label="예정기간" value={rental.rentalPeriod ? `${rental.rentalPeriod}일` : "-"} />
              <DetailItem label="예정연인원" value={expectedPersonDays ? `${expectedPersonDays}명` : "-"} />
            </div>
            {rentalNotes && (
              <div className="mt-4 pt-4 border-t border-gray-300">
                <DetailItem label="대여 시 비고" value={rentalNotes} fullWidth />
              </div>
            )}
            <div className="mt-4 pt-4 border-t border-gray-300">
              <DetailItem label="대여 일시" value={new Date(rental.createdAt).toLocaleString("ko-KR")} fullWidth />
            </div>
          </div>

          {/* 반납 정보 섹션 (반납된 경우에만 표시) */}
          {isReturned && rental.actualReturnDate && (
            <div className="border-2 border-black p-6 rounded-lg bg-green-50">
              <h3 className="text-xl font-bold text-black mb-4 leading-relaxed">반납 정보</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DetailItem label="반납일" value={new Date(rental.actualReturnDate).toLocaleDateString("ko-KR")} />
                <DetailItem label="기간(일)" value={actualPeriod ? `${actualPeriod}일` : "-"} />
                <DetailItem label="연인원" value={actualPersonDays ? `${actualPersonDays}명` : "-"} />
              </div>
              {returnNotes && (
                <div className="mt-4 pt-4 border-t border-gray-300">
                  <DetailItem label="반납 시 비고" value={returnNotes} fullWidth />
                </div>
              )}
              <div className="mt-4 pt-4 border-t border-gray-300">
                <DetailItem label="반납 일시" value={new Date(rental.actualReturnDate).toLocaleString("ko-KR")} fullWidth />
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function DetailItem({ label, value, fullWidth = false }: { label: string; value: string; fullWidth?: boolean }) {
  return (
    <div className={fullWidth ? "col-span-full" : ""}>
      <div className="text-base font-semibold text-gray-700 leading-relaxed">{label}</div>
      <div className="text-lg text-black leading-relaxed mt-1">{value}</div>
    </div>
  )
}
