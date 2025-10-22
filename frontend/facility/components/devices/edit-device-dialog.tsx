"use client"
import { useState, useEffect } from "react"
import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useUpdateDevice } from "@/lib/hooks/useDevices"
import type { DeviceItem } from "@/lib/api/device.service"

interface EditDeviceDialogProps {
  device: DeviceItem
  onClose: () => void
}

const deviceTypeLabels = {
  "AR글라스": "AR 글라스",
  "골전도 이어폰": "골전도 이어폰",
  "스마트폰": "스마트폰",
  "기타": "기타",
} as const

const statusLabels = {
  available: "사용가능",
  rented: "대여중",
  broken: "고장",
  maintenance: "수리중",
} as const

export function EditDeviceDialog({ device, onClose }: EditDeviceDialogProps) {
  const { mutate: updateDevice, isPending } = useUpdateDevice()
  const [formData, setFormData] = useState({
    deviceType: device.deviceType,
    deviceCode: device.deviceCode,
    notes: device.notes || "",
    serialNumber: device.serialNumber || "",
    status: device.status,
  })
  const [error, setError] = useState("")

  // Prevent body scroll when dialog is open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow
    const originalPaddingRight = document.body.style.paddingRight

    // Get scrollbar width
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth

    document.body.style.overflow = 'hidden'
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`
    }

    return () => {
      document.body.style.overflow = originalOverflow
      document.body.style.paddingRight = originalPaddingRight
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!formData.deviceCode.trim()) {
      setError("기기 명칭은 필수 입력 항목입니다")
      return
    }

    updateDevice(
      {
        id: device.id,
        data: {
          deviceType: formData.deviceType,
          deviceCode: formData.deviceCode.trim(),
          notes: formData.notes.trim() || undefined,
          serialNumber: formData.serialNumber.trim() || undefined,
          status: formData.status,
        }
      },
      {
        onSuccess: () => {
          onClose()
        },
        onError: (error: any) => {
          setError(error.response?.data?.message || "기기 수정에 실패했습니다")
        },
      }
    )
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}>
      <div className="bg-white border-2 border-black rounded-lg p-8 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-black mb-6 leading-relaxed">기기 정보 수정</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="deviceType" className="text-lg font-semibold text-black leading-relaxed">
              기기 종류
            </Label>
            <Select
              value={formData.deviceType}
              onValueChange={(value) => setFormData({ ...formData, deviceType: value as typeof formData.deviceType })}
            >
              <SelectTrigger className="mt-2 min-h-[44px] text-lg border-2 border-black">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(deviceTypeLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value} className="text-lg">
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="deviceCode" className="text-lg font-semibold text-black leading-relaxed">
              기기 명칭 *
            </Label>
            <Input
              id="deviceCode"
              type="text"
              value={formData.deviceCode}
              onChange={(e) => setFormData({ ...formData, deviceCode: e.target.value })}
              className="mt-2 min-h-[44px] text-lg border-2 border-black"
              placeholder="예: AR-001"
            />
          </div>

          <div>
            <Label htmlFor="notes" className="text-lg font-semibold text-black leading-relaxed">
              메모
            </Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="mt-2 min-h-[88px] text-lg border-2 border-black resize-none"
              placeholder="추가 정보나 특이사항을 입력하세요"
            />
          </div>

          <div>
            <Label htmlFor="serialNumber" className="text-lg font-semibold text-black leading-relaxed">
              시리얼 번호
            </Label>
            <Input
              id="serialNumber"
              type="text"
              value={formData.serialNumber}
              onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
              className="mt-2 min-h-[44px] text-lg border-2 border-black"
              placeholder="예: SN202400001"
            />
          </div>

          <div>
            <Label htmlFor="status" className="text-lg font-semibold text-black leading-relaxed">
              상태
            </Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value as typeof formData.status })}
            >
              <SelectTrigger className="mt-2 min-h-[44px] text-lg border-2 border-black">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(statusLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value} className="text-lg">
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {error && (
            <div className="p-4 bg-red-100 border-2 border-red-600 rounded-lg">
              <p className="text-lg text-red-800 leading-relaxed">{error}</p>
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              onClick={onClose}
              className="flex-1 min-h-[44px] bg-white text-black border-2 border-black hover:bg-gray-100 text-lg py-3"
            >
              취소
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="flex-1 min-h-[44px] bg-black text-white hover:bg-gray-800 border-2 border-black text-lg py-3"
            >
              {isPending ? "수정 중..." : "수정"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
