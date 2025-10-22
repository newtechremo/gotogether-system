"use client"
import { useState, useEffect } from "react"
import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { FacilityDevice } from "@/lib/api/device.service"
import { useCreateRental } from "@/lib/hooks/useRentals"
import { DisabilityType, RentalType, AgeGroup, Gender } from "@/lib/api/rental.service"

type DeviceType = "AR글라스" | "골전도 이어폰" | "스마트폰"

interface RentFormProps {
  devices: FacilityDevice[]
  preselectedType?: DeviceType
}

const deviceTypeLabels = {
  "AR글라스": "AR 글라스",
  "골전도 이어폰": "골전도 이어폰",
  "스마트폰": "스마트폰",
}

const regions = [
  "서울",
  "경기",
  "인천",
  "강원",
  "대전",
  "세종",
  "충북",
  "충남",
  "광주",
  "전북",
  "전남",
  "부산",
  "울산",
  "대구",
  "경북",
  "경남",
  "제주",
]

const ageGroups = ["10대", "20대", "30대", "40대", "50대", "60대", "70대이상"]

const disabilityTypes = [
  { value: DisabilityType.VISUAL, label: "시각장애" },
  { value: DisabilityType.HEARING, label: "청각장애" },
  { value: DisabilityType.OTHER, label: "기타" },
]

const getDayOfWeek = (dateString: string): string => {
  const days = ["일", "월", "화", "수", "목", "금", "토"]
  const date = new Date(dateString)
  return days[date.getDay()]
}

const calculatePeriod = (rentalDate: string, returnDate: string): number => {
  const rental = new Date(rentalDate)
  const returnD = new Date(returnDate)
  const diffTime = returnD.getTime() - rental.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays + 1
}

export function RentForm({ devices, preselectedType }: RentFormProps) {
  const { mutate: createRental, isPending } = useCreateRental()
  const [formData, setFormData] = useState({
    deviceType: preselectedType || ("" as DeviceType | ""),
    rentalDate: new Date().toISOString().split("T")[0],
    rentalDayOfWeek: getDayOfWeek(new Date().toISOString().split("T")[0]),
    rentalType: "" as RentalType | "",
    renterName: "",
    phoneNumber: "",
    groupName: "",
    gender: "" as Gender | "",
    region: "",
    residence: "",
    ageGroup: "" as AgeGroup | "",
    rentalPurpose: "영화 상영장 관람",
    disabilityType: "" as DisabilityType | "",
    quantity: 1,
    returnDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    period: 7,
    totalPersonDays: 7,
    notes: "",
  })
  const [error, setError] = useState("")

  useEffect(() => {
    if (formData.rentalDate) {
      setFormData((prev) => ({
        ...prev,
        rentalDayOfWeek: getDayOfWeek(formData.rentalDate),
      }))
    }
  }, [formData.rentalDate])

  useEffect(() => {
    if (formData.rentalDate && formData.returnDate) {
      const period = calculatePeriod(formData.rentalDate, formData.returnDate)
      const totalPersonDays = formData.quantity * period
      setFormData((prev) => ({
        ...prev,
        period,
        totalPersonDays,
      }))
    }
  }, [formData.rentalDate, formData.returnDate, formData.quantity])

  useEffect(() => {
    if (formData.rentalType === "개인") {
      setFormData((prev) => ({
        ...prev,
        groupName: "",
      }))
    }
  }, [formData.rentalType])

  // Get available devices for selected type
  const availableDevices = devices.filter((device) => device.deviceType === formData.deviceType && device.qtyAvailable > 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (
      !formData.deviceType ||
      !formData.rentalDate ||
      !formData.rentalType ||
      !formData.renterName.trim() ||
      !formData.phoneNumber.trim() ||
      !formData.gender ||
      !formData.region ||
      !formData.residence.trim() ||
      !formData.ageGroup ||
      !formData.rentalPurpose.trim() ||
      !formData.disabilityType ||
      !formData.returnDate
    ) {
      setError("모든 필수 항목을 입력해주세요")
      return
    }

    if (formData.rentalType === RentalType.GROUP && !formData.groupName.trim()) {
      setError("단체 대여의 경우 단체명을 입력해주세요")
      return
    }

    if (availableDevices.length === 0) {
      setError("선택한 기기 종류의 대여 가능한 기기가 없습니다")
      return
    }

    createRental({
      renterName: formData.renterName.trim(),
      renterPhone: formData.phoneNumber.trim(),
      renterDisabilityId: formData.disabilityType,
      rentalType: formData.rentalType,
      rentalDate: formData.rentalDate,
      returnDate: formData.returnDate,
      purpose: formData.rentalPurpose.trim(),
      region: formData.region,
      ageGroup: formData.ageGroup,
      gender: formData.gender,
      devices: [
        {
          deviceType: formData.deviceType,
          quantity: formData.quantity,
        }
      ],
      memo: formData.notes.trim() || undefined,
    }, {
      onSuccess: () => {
        // Reset form
        setFormData({
          deviceType: preselectedType || "",
          rentalDate: new Date().toISOString().split("T")[0],
          rentalDayOfWeek: getDayOfWeek(new Date().toISOString().split("T")[0]),
          rentalType: "",
          renterName: "",
          phoneNumber: "",
          groupName: "",
          gender: "",
          region: "",
          residence: "",
          ageGroup: "",
          rentalPurpose: "영화 상영장 관람",
          disabilityType: "",
          quantity: 1,
          returnDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          period: 7,
          totalPersonDays: 7,
          notes: "",
        })
      },
      onError: (error: any) => {
        setError(error.response?.data?.message || "대여 처리에 실패했습니다")
      }
    })
  }

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold text-black mb-6 leading-relaxed">기기 대여</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. 기기종류 */}
        <div>
          <Label htmlFor="deviceType" className="text-lg font-semibold text-black leading-relaxed">
            1. 기기 종류 *
          </Label>
          <Select
            value={formData.deviceType}
            onValueChange={(value) => {
              setFormData({ ...formData, deviceType: value as DeviceType })
            }}
          >
            <SelectTrigger className="mt-2 min-h-[44px] text-lg border-2 border-black">
              <SelectValue placeholder="기기 종류를 선택하세요" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(deviceTypeLabels).map(([value, label]) => {
                const availableCount = devices
                  .filter((d) => d.deviceType === value)
                  .reduce((sum, d) => sum + d.qtyAvailable, 0)

                return (
                  <SelectItem key={value} value={value} className="text-lg" disabled={availableCount === 0}>
                    {label} {availableCount === 0 ? "(품절)" : `(${availableCount}개 가능)`}
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
        </div>

        {/* 2. 대여일 */}
        <div>
          <Label htmlFor="rentalDate" className="text-lg font-semibold text-black leading-relaxed">
            2. 대여일 *
          </Label>
          <Input
            id="rentalDate"
            type="date"
            value={formData.rentalDate}
            onChange={(e) => setFormData({ ...formData, rentalDate: e.target.value })}
            className="mt-2 min-h-[44px] text-lg border-2 border-black"
          />
        </div>

        {/* 3. 대여요일 */}
        <div>
          <Label htmlFor="rentalDayOfWeek" className="text-lg font-semibold text-black leading-relaxed">
            3. 대여요일
          </Label>
          <Input
            id="rentalDayOfWeek"
            type="text"
            value={formData.rentalDayOfWeek}
            readOnly
            className="mt-2 min-h-[44px] text-lg border-2 border-black bg-gray-50"
          />
        </div>

        {/* 4. 유형 */}
        <div>
          <Label htmlFor="rentalType" className="text-lg font-semibold text-black leading-relaxed">
            4. 유형 *
          </Label>
          <Select
            value={formData.rentalType}
            onValueChange={(value) => setFormData({ ...formData, rentalType: value as RentalType })}
          >
            <SelectTrigger className="mt-2 min-h-[44px] text-lg border-2 border-black">
              <SelectValue placeholder="유형을 선택하세요" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={RentalType.INDIVIDUAL} className="text-lg">
                개인
              </SelectItem>
              <SelectItem value={RentalType.GROUP} className="text-lg">
                단체
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 5. 대여자이름 */}
        <div>
          <Label htmlFor="renterName" className="text-lg font-semibold text-black leading-relaxed">
            5. 대여자 이름 *
          </Label>
          <Input
            id="renterName"
            type="text"
            value={formData.renterName}
            onChange={(e) => setFormData({ ...formData, renterName: e.target.value })}
            className="mt-2 min-h-[44px] text-lg border-2 border-black"
            placeholder="대여자 이름을 입력하세요"
          />
        </div>

        {/* 6. 핸드폰번호 */}
        <div>
          <Label htmlFor="phoneNumber" className="text-lg font-semibold text-black leading-relaxed">
            6. 핸드폰번호 *
          </Label>
          <Input
            id="phoneNumber"
            type="tel"
            value={formData.phoneNumber}
            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
            className="mt-2 min-h-[44px] text-lg border-2 border-black"
            placeholder="010-1234-5678"
          />
        </div>

        {/* 7. 단체명 */}
        {formData.rentalType === RentalType.GROUP && (
          <div>
            <Label htmlFor="groupName" className="text-lg font-semibold text-black leading-relaxed">
              7. 단체명 *
            </Label>
            <Input
              id="groupName"
              type="text"
              value={formData.groupName}
              onChange={(e) => setFormData({ ...formData, groupName: e.target.value })}
              className="mt-2 min-h-[44px] text-lg border-2 border-black"
              placeholder="단체명을 입력하세요"
            />
          </div>
        )}

        {/* 8. 성별 */}
        <div>
          <Label htmlFor="gender" className="text-lg font-semibold text-black leading-relaxed">
            {formData.rentalType === RentalType.GROUP ? "8" : "7"}. 성별 *
          </Label>
          <Select
            value={formData.gender}
            onValueChange={(value) => setFormData({ ...formData, gender: value as Gender })}
          >
            <SelectTrigger className="mt-2 min-h-[44px] text-lg border-2 border-black">
              <SelectValue placeholder="성별을 선택하세요" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={Gender.MALE} className="text-lg">
                남성
              </SelectItem>
              <SelectItem value={Gender.FEMALE} className="text-lg">
                여성
              </SelectItem>
              <SelectItem value={Gender.OTHER} className="text-lg">
                기타
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 9. 지역 */}
        <div>
          <Label htmlFor="region" className="text-lg font-semibold text-black leading-relaxed">
            {formData.rentalType === RentalType.GROUP ? "9" : "8"}. 지역 *
          </Label>
          <Select value={formData.region} onValueChange={(value) => setFormData({ ...formData, region: value })}>
            <SelectTrigger className="mt-2 min-h-[44px] text-lg border-2 border-black">
              <SelectValue placeholder="지역을 선택하세요" />
            </SelectTrigger>
            <SelectContent>
              {regions.map((region) => (
                <SelectItem key={region} value={region} className="text-lg">
                  {region}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 10. 거주지 */}
        <div>
          <Label htmlFor="residence" className="text-lg font-semibold text-black leading-relaxed">
            {formData.rentalType === RentalType.GROUP ? "10" : "9"}. 거주지 (시/군/구) *
          </Label>
          <Input
            id="residence"
            type="text"
            value={formData.residence}
            onChange={(e) => setFormData({ ...formData, residence: e.target.value })}
            className="mt-2 min-h-[44px] text-lg border-2 border-black"
            placeholder="예: 강남구, 수원시"
          />
        </div>

        {/* 11. 연령대 */}
        <div>
          <Label htmlFor="ageGroup" className="text-lg font-semibold text-black leading-relaxed">
            {formData.rentalType === RentalType.GROUP ? "11" : "10"}. 연령대 *
          </Label>
          <Select value={formData.ageGroup} onValueChange={(value) => setFormData({ ...formData, ageGroup: value as AgeGroup })}>
            <SelectTrigger className="mt-2 min-h-[44px] text-lg border-2 border-black">
              <SelectValue placeholder="연령대를 선택하세요" />
            </SelectTrigger>
            <SelectContent>
              {ageGroups.map((age) => (
                <SelectItem key={age} value={age} className="text-lg">
                  {age}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 12. 대여목적 */}
        <div>
          <Label htmlFor="rentalPurpose" className="text-lg font-semibold text-black leading-relaxed">
            {formData.rentalType === RentalType.GROUP ? "12" : "11"}. 대여목적 *
          </Label>
          <Input
            id="rentalPurpose"
            type="text"
            value={formData.rentalPurpose}
            onChange={(e) => setFormData({ ...formData, rentalPurpose: e.target.value })}
            className="mt-2 min-h-[44px] text-lg border-2 border-black"
            placeholder="예: 영화 상영장 관람"
          />
        </div>

        {/* 13. 장애유형 */}
        <div>
          <Label htmlFor="disabilityType" className="text-lg font-semibold text-black leading-relaxed">
            {formData.rentalType === RentalType.GROUP ? "13" : "12"}. 장애유형 *
          </Label>
          <Select
            value={formData.disabilityType}
            onValueChange={(value) => setFormData({ ...formData, disabilityType: value as DisabilityType })}
          >
            <SelectTrigger className="mt-2 min-h-[44px] text-lg border-2 border-black">
              <SelectValue placeholder="장애유형을 선택하세요" />
            </SelectTrigger>
            <SelectContent>
              {disabilityTypes.map((type) => (
                <SelectItem key={type.value} value={type.value} className="text-lg">
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 14. 수량 */}
        <div>
          <Label htmlFor="quantity" className="text-lg font-semibold text-black leading-relaxed">
            {formData.rentalType === RentalType.GROUP ? "14" : "13"}. 수량 *
          </Label>
          <Input
            id="quantity"
            type="number"
            min="1"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: Number.parseInt(e.target.value) || 1 })}
            className="mt-2 min-h-[44px] text-lg border-2 border-black"
          />
        </div>

        {/* 반납일 (for calculation) */}
        <div>
          <Label htmlFor="returnDate" className="text-lg font-semibold text-black leading-relaxed">
            반납일 *
          </Label>
          <Input
            id="returnDate"
            type="date"
            value={formData.returnDate}
            onChange={(e) => setFormData({ ...formData, returnDate: e.target.value })}
            className="mt-2 min-h-[44px] text-lg border-2 border-black"
          />
        </div>

        {/* 15. 예정기간(일) */}
        <div>
          <Label htmlFor="period" className="text-lg font-semibold text-black leading-relaxed">
            {formData.rentalType === RentalType.GROUP ? "15" : "14"}. 예정기간 (일)
          </Label>
          <Input
            id="period"
            type="number"
            value={formData.period}
            readOnly
            className="mt-2 min-h-[44px] text-lg border-2 border-black bg-gray-50"
          />
        </div>

        {/* 16. 예정연인원 */}
        <div>
          <Label htmlFor="totalPersonDays" className="text-lg font-semibold text-black leading-relaxed">
            {formData.rentalType === RentalType.GROUP ? "16" : "15"}. 예정연인원
          </Label>
          <Input
            id="totalPersonDays"
            type="number"
            value={formData.totalPersonDays}
            readOnly
            className="mt-2 min-h-[44px] text-lg border-2 border-black bg-gray-50"
          />
        </div>

        {/* 17. 비고 */}
        <div>
          <Label htmlFor="notes" className="text-lg font-semibold text-black leading-relaxed">
            {formData.rentalType === RentalType.GROUP ? "17" : "16"}. 비고
          </Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="mt-2 min-h-[100px] text-lg border-2 border-black"
            placeholder="추가 메모사항을 입력하세요 (선택사항)"
          />
        </div>

        {error && (
          <div className="p-4 bg-red-100 border-2 border-red-600 rounded-lg">
            <p className="text-lg text-red-800 leading-relaxed">{error}</p>
          </div>
        )}

        <div className="pt-4">
          <Button
            type="submit"
            disabled={isPending}
            className="w-full min-h-[60px] bg-black text-white hover:bg-gray-800 border-2 border-black text-xl font-semibold"
          >
            {isPending ? "대여 처리 중..." : "대여 완료"}
          </Button>
        </div>
      </form>
    </div>
  )
}
