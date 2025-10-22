"use client"
import { useState, useEffect } from "react"
import type React from "react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useDevices } from "@/lib/hooks/useDevices"
import { useCreateRepair } from "@/lib/hooks/useRepairs"
import type { DeviceItem } from "@/lib/api/device.service"

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
  const { data: devices } = useDevices()
  const { mutate: createRepair, isPending } = useCreateRepair()

  const [deviceType, setDeviceType] = useState("")
  const [selectedDeviceItemId, setSelectedDeviceItemId] = useState<number | null>(null)
  const [repairDate, setRepairDate] = useState(new Date().toISOString().split("T")[0])
  const [repairDescription, setRepairDescription] = useState("")
  const [repairCost, setRepairCost] = useState("")
  const [repairCompany, setRepairCompany] = useState("")
  const [memo, setMemo] = useState("")

  // Get available device items for selected device type
  const availableDeviceItems = devices
    ?.find((d) => d.deviceType === deviceType)
    ?.deviceItems.filter((item) => item.status !== "rented") || []

  // Reset device item selection when device type changes
  useEffect(() => {
    setSelectedDeviceItemId(null)
  }, [deviceType])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedDeviceItemId || !repairDescription.trim()) return

    createRepair(
      {
        facilityDeviceItemId: selectedDeviceItemId,
        repairDate,
        repairDescription: repairDescription.trim(),
        repairCost: repairCost ? parseFloat(repairCost) : undefined,
        repairCompany: repairCompany.trim() || undefined,
        memo: memo.trim() || undefined,
      },
      {
        onSuccess: () => {
          // Reset form
          setDeviceType("")
          setSelectedDeviceItemId(null)
          setRepairDate(new Date().toISOString().split("T")[0])
          setRepairDescription("")
          setRepairCost("")
          setRepairCompany("")
          setMemo("")
          onOpenChange(false)
          onSuccess?.()
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl sm:max-w-3xl max-h-[90vh] overflow-y-auto border-2 border-black">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-black leading-relaxed">새 고장신고 접수</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="device-type" className="text-lg font-medium text-black leading-relaxed">
                기기 종류 *
              </Label>
              <Select value={deviceType} onValueChange={setDeviceType}>
                <SelectTrigger className="text-lg border-2 border-black min-h-[44px] mt-2">
                  <SelectValue placeholder="기기 종류 선택" />
                </SelectTrigger>
                <SelectContent>
                  {devices?.map((device) => (
                    <SelectItem key={device.id} value={device.deviceType} className="text-lg">
                      {DEVICE_TYPE_LABELS[device.deviceType] || device.deviceType}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="device-item" className="text-lg font-medium text-black leading-relaxed">
                장비 선택 *
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
                          ? "사용 가능한 장비가 없습니다"
                          : "장비 선택"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {availableDeviceItems.map((item) => (
                    <SelectItem key={item.id} value={item.id.toString()} className="text-lg">
                      {item.deviceCode} ({item.status === "available" ? "정상" : item.status === "broken" ? "고장" : "유지보수"})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="repair-date" className="text-lg font-medium text-black leading-relaxed">
              수리 시작일 *
            </Label>
            <Input
              id="repair-date"
              type="date"
              value={repairDate}
              onChange={(e) => setRepairDate(e.target.value)}
              className="text-lg border-2 border-black min-h-[44px] mt-2"
              required
            />
          </div>

          <div>
            <Label htmlFor="repair-description" className="text-lg font-medium text-black leading-relaxed">
              고장 증상 *
            </Label>
            <Textarea
              id="repair-description"
              value={repairDescription}
              onChange={(e) => setRepairDescription(e.target.value)}
              placeholder="고장 증상을 상세히 입력하세요"
              className="text-lg border-2 border-black min-h-[100px] resize-none mt-2"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="repair-cost" className="text-lg font-medium text-black leading-relaxed">
                수리 비용 (원)
              </Label>
              <Input
                id="repair-cost"
                type="number"
                value={repairCost}
                onChange={(e) => setRepairCost(e.target.value)}
                placeholder="예상 수리 비용"
                className="text-lg border-2 border-black min-h-[44px] mt-2"
                min="0"
                step="1000"
              />
            </div>

            <div>
              <Label htmlFor="repair-company" className="text-lg font-medium text-black leading-relaxed">
                수리 업체
              </Label>
              <Input
                id="repair-company"
                value={repairCompany}
                onChange={(e) => setRepairCompany(e.target.value)}
                placeholder="수리 업체명"
                className="text-lg border-2 border-black min-h-[44px] mt-2"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="memo" className="text-lg font-medium text-black leading-relaxed">
              메모
            </Label>
            <Textarea
              id="memo"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="추가 메모사항 (선택)"
              className="text-lg border-2 border-black min-h-[80px] resize-none mt-2"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 text-lg border-2 border-black text-black hover:bg-gray-100 min-h-[44px]"
              disabled={isPending}
            >
              취소
            </Button>
            <Button
              type="submit"
              disabled={!selectedDeviceItemId || !repairDescription.trim() || isPending}
              className="flex-1 text-lg bg-black text-white hover:bg-gray-800 min-h-[44px]"
            >
              {isPending ? "등록 중..." : "등록"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
