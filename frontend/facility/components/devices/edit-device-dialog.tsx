"use client"
import { useState } from "react"
import type React from "react"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useUpdateDevice } from "@/lib/hooks/useDevices"
import type { FacilityDevice } from "@/lib/api/device.service"

interface EditDeviceDialogProps {
  device: FacilityDevice
  onClose: () => void
}

const deviceTypeLabels = {
  "AR글라스": "AR 글라스",
  "골전도 이어폰": "골전도 이어폰",
  "스마트폰": "스마트폰",
} as const

export function EditDeviceDialog({ device, onClose }: EditDeviceDialogProps) {
  const { mutate: updateDevice, isPending } = useUpdateDevice()
  const [formData, setFormData] = useState({
    memo: device.memo || "",
  })
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    updateDevice(
      { id: device.id, data: { memo: formData.memo || undefined } },
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white border-2 border-black rounded-lg p-8 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold text-black mb-6 leading-relaxed">기기 정보 수정</h2>

        <div className="mb-6 p-4 bg-gray-100 border border-gray-300 rounded-lg">
          <p className="text-lg text-black leading-relaxed">
            <strong>기기 종류:</strong> {deviceTypeLabels[device.deviceType as keyof typeof deviceTypeLabels]}
          </p>
          <p className="text-lg text-black leading-relaxed mt-2">
            <strong>총 수량:</strong> {device.qtyTotal}개
          </p>
          <p className="text-lg text-black leading-relaxed mt-2">
            <strong>대여 가능:</strong> {device.qtyAvailable}개
          </p>
          <p className="text-lg text-black leading-relaxed mt-2">
            <strong>현재 대여중:</strong> {device.qtyRented}개
          </p>
          <p className="text-lg text-black leading-relaxed mt-2">
            <strong>고장:</strong> {device.qtyBroken}개
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="memo" className="text-lg font-semibold text-black leading-relaxed">
              메모
            </Label>
            <Textarea
              id="memo"
              value={formData.memo}
              onChange={(e) => setFormData({ ...formData, memo: e.target.value })}
              className="mt-2 min-h-[88px] text-lg border-2 border-black resize-none"
              placeholder="기기 관련 메모를 입력하세요"
            />
            <p className="text-sm text-gray-600 mt-2 leading-relaxed">
              * 수량 변경은 개별 기기 아이템을 추가하거나 삭제하여 조정할 수 있습니다.
            </p>
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
