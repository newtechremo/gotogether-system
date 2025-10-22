"use client"
import { useState, useEffect } from "react"
import type React from "react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useDevices } from "@/lib/hooks/useDevices"
import { useCreateRepair } from "@/lib/hooks/useRepairs"

interface AddRepairDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

const DEVICE_TYPE_LABELS: Record<string, string> = {
  "AR글라스": "AR 글라스",
  "골전도 이어폰": "골전도 이어폰",
  "스마트폰": "스마트폰",
}

export function AddRepairDialog({ open, onOpenChange, onSuccess }: AddRepairDialogProps) {
  const { data: deviceItems } = useDevices()
  const { mutate: createRepair, isPending } = useCreateRepair()

  const [deviceType, setDeviceType] = useState("")
  const [selectedDeviceItemId, setSelectedDeviceItemId] = useState<number | null>(null)
  const [symptomDescription, setSymptomDescription] = useState("")

  // Group device items by type and count available ones
  const deviceTypeGroups = deviceItems?.reduce((acc, item) => {
    if (!acc[item.deviceType]) {
      acc[item.deviceType] = {
        deviceType: item.deviceType,
        qtyAvailable: 0,
      }
    }
    if (item.status === "available") {
      acc[item.deviceType].qtyAvailable++
    }
    return acc
  }, {} as Record<string, { deviceType: string; qtyAvailable: number }>)

  const uniqueDeviceTypes = deviceTypeGroups ? Object.values(deviceTypeGroups) : []

  // Get available device items for selected device type
  const availableDeviceItems = deviceItems?.filter(
    (item) => item.deviceType === deviceType && item.status === "available"
  ) || []

  // Reset device item selection when device type changes
  useEffect(() => {
    setSelectedDeviceItemId(null)
  }, [deviceType])

  // Prevent body scroll when dialog is open
  useEffect(() => {
    if (!open) return

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
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!deviceType || !selectedDeviceItemId || !symptomDescription.trim()) return

    createRepair(
      {
        deviceType,
        facilityDeviceItemId: selectedDeviceItemId,
        symptomDescription: symptomDescription.trim(),
      },
      {
        onSuccess: () => {
          // Reset form
          setDeviceType("")
          setSelectedDeviceItemId(null)
          setSymptomDescription("")
          onOpenChange(false)
          onSuccess?.()
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-2xl max-h-[90vh] overflow-y-auto border-2 border-black"
        style={{ backgroundColor: 'white' }}
      >
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-black leading-relaxed">고장신고 접수</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 기기 종류 선택 */}
          <div>
            <Label htmlFor="device-type" className="text-lg font-bold text-black leading-relaxed">
              1. 기기 종류 *
            </Label>
            <Select value={deviceType} onValueChange={setDeviceType}>
              <SelectTrigger className="text-lg border-2 border-black min-h-[44px] mt-2">
                <SelectValue placeholder="기기 종류를 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {uniqueDeviceTypes.map((typeGroup) => (
                  <SelectItem key={typeGroup.deviceType} value={typeGroup.deviceType} className="text-lg">
                    {DEVICE_TYPE_LABELS[typeGroup.deviceType] || typeGroup.deviceType} ({typeGroup.qtyAvailable}개 사용 가능)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 기기 선택 */}
          <div>
            <Label htmlFor="device-item" className="text-lg font-bold text-black leading-relaxed">
              2. 기기 선택 *
            </Label>
            <Select
              value={selectedDeviceItemId?.toString() || ""}
              onValueChange={(value) => setSelectedDeviceItemId(parseInt(value))}
              disabled={!deviceType || availableDeviceItems.length === 0}
            >
              <SelectTrigger className="text-lg border-2 border-black min-h-[44px] mt-2">
                <SelectValue
                  placeholder={
                    !deviceType
                      ? "먼저 기기 종류를 선택하세요"
                      : availableDeviceItems.length === 0
                        ? "사용 가능한 기기가 없습니다"
                        : "기기를 선택하세요"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {availableDeviceItems.map((item) => (
                  <SelectItem key={item.id} value={item.id.toString()} className="text-lg">
                    {item.deviceCode}
                    {item.serialNumber && ` (S/N: ${item.serialNumber})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 고장 증상 */}
          <div>
            <Label htmlFor="symptom-description" className="text-lg font-bold text-black leading-relaxed">
              3. 고장 증상 *
            </Label>
            <Textarea
              id="symptom-description"
              value={symptomDescription}
              onChange={(e) => setSymptomDescription(e.target.value)}
              placeholder="고장 증상을 상세히 입력하세요 (예: 화면이 깨져서 표시가 안됩니다)"
              className="text-lg border-2 border-black min-h-[120px] resize-none mt-2"
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 text-lg border-2 border-black text-black hover:bg-gray-100 min-h-[48px] font-semibold"
              disabled={isPending}
            >
              취소
            </Button>
            <Button
              type="submit"
              disabled={!deviceType || !selectedDeviceItemId || !symptomDescription.trim() || isPending}
              className="flex-1 text-lg bg-black text-white hover:bg-gray-800 min-h-[48px] font-semibold"
            >
              {isPending ? "접수 중..." : "접수"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
