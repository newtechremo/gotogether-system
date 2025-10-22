"use client"
import { useState } from "react"
import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCreateDevice } from "@/lib/hooks/useDevices"
import type { CreateFacilityDeviceDto } from "@/lib/api/device.service"

interface AddDeviceDialogProps {
  onClose: () => void
}

const deviceTypeLabels = {
  "AR글라스": "AR 글라스",
  "골전도 이어폰": "골전도 이어폰",
  "스마트폰": "스마트폰",
} as const

export function AddDeviceDialog({ onClose }: AddDeviceDialogProps) {
  const { mutate: createDevice, isPending } = useCreateDevice()
  const [formData, setFormData] = useState({
    type: "" as "AR글라스" | "골전도 이어폰" | "스마트폰" | "",
    quantity: "",
    memo: "",
  })
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!formData.type || !formData.quantity) {
      setError("기기 종류와 수량은 필수 입력 항목입니다")
      return
    }

    const quantity = Number.parseInt(formData.quantity)
    if (isNaN(quantity) || quantity <= 0) {
      setError("수량은 1 이상의 숫자여야 합니다")
      return
    }

    // 수량만큼 deviceItems 배열 생성
    const deviceItems = Array.from({ length: quantity }, (_, index) => ({
      deviceCode: `${formData.type}-${Date.now()}-${index + 1}`,
      serialNumber: `SN-${Date.now()}-${index + 1}`,
      registrationDate: new Date().toISOString().split('T')[0],
    }))

    const data: CreateFacilityDeviceDto = {
      deviceType: formData.type,
      deviceItems,
      memo: formData.memo || undefined,
    }

    createDevice(data, {
      onSuccess: () => {
        onClose()
      },
      onError: (error: any) => {
        setError(error.response?.data?.message || "기기 등록에 실패했습니다")
      },
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white border-2 border-black rounded-lg p-8 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold text-black mb-6 leading-relaxed">신규 기기 등록</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="type" className="text-lg font-semibold text-black leading-relaxed">
              기기 종류 *
            </Label>
            <Select
              value={formData.type}
              onValueChange={(value) => setFormData({ ...formData, type: value as typeof formData.type })}
            >
              <SelectTrigger className="mt-2 min-h-[44px] text-lg border-2 border-black">
                <SelectValue placeholder="기기 종류를 선택하세요" />
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
            <Label htmlFor="quantity" className="text-lg font-semibold text-black leading-relaxed">
              수량 *
            </Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              className="mt-2 min-h-[44px] text-lg border-2 border-black"
              placeholder="1"
            />
          </div>

          <div>
            <Label htmlFor="memo" className="text-lg font-semibold text-black leading-relaxed">
              메모 (선택)
            </Label>
            <Textarea
              id="memo"
              value={formData.memo}
              onChange={(e) => setFormData({ ...formData, memo: e.target.value })}
              className="mt-2 min-h-[88px] text-lg border-2 border-black resize-none"
              placeholder="추가 정보나 특이사항을 입력하세요"
            />
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
              {isPending ? "등록 중..." : "등록"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
