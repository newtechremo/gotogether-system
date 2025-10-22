"use client"
import { useState } from "react"
import type React from "react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import type { FacilityRepair } from "@/lib/api/repair.service"
import { RepairStatus } from "@/lib/api/repair.service"
import { useUpdateRepair } from "@/lib/hooks/useRepairs"

const STATUS_LABELS = {
  [RepairStatus.IN_REPAIR]: "수리중",
  [RepairStatus.COMPLETED]: "수리완료",
}

interface UpdateStatusDialogProps {
  repair: FacilityRepair
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function UpdateStatusDialog({ repair, open, onOpenChange, onSuccess }: UpdateStatusDialogProps) {
  const { mutate: updateRepair, isPending } = useUpdateRepair()

  const [status, setStatus] = useState<RepairStatus>(repair.status as RepairStatus)
  const [memo, setMemo] = useState(repair.repairNotes || "")
  const [repairCost, setRepairCost] = useState(repair.repairCost?.toString() || "")
  const [repairVendor, setRepairVendor] = useState(repair.repairVendor || "")
  const [completionDate, setCompletionDate] = useState(
    repair.repairEndDate ? new Date(repair.repairEndDate).toISOString().split("T")[0] : ""
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const updateData = {
      repairStatus: status,
      repairCost: repairCost ? parseFloat(repairCost) : undefined,
      repairCompany: repairVendor.trim() || undefined,
      completionDate: completionDate || undefined,
      memo: memo.trim() || undefined,
    }

    console.log('=== UPDATE REPAIR DATA ===')
    console.log('Repair ID:', repair.id)
    console.log('Update Data:', updateData)
    console.log('========================')

    updateRepair(
      {
        id: repair.id,
        data: updateData,
      },
      {
        onSuccess: () => {
          onOpenChange(false)
          onSuccess?.()
        },
        onError: (error: any) => {
          console.error('=== UPDATE ERROR ===')
          console.error('Error:', error)
          console.error('Error Response:', error?.response?.data)
          console.error('===================')
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto border-2 border-black">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-black leading-relaxed">수리 상세 / 상태 변경</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* 기기 정보 섹션 */}
          <div className="bg-blue-50 p-4 rounded-lg border-2 border-black">
            <h3 className="text-lg font-bold text-black mb-3 leading-relaxed">기기 정보</h3>
            <div className="grid grid-cols-2 gap-3 text-base">
              <div>
                <span className="font-semibold text-gray-700">장비 코드:</span>
                <span className="ml-2 text-black">{repair.deviceItem?.deviceCode || "-"}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-700">장비 유형:</span>
                <span className="ml-2 text-black">{repair.deviceType || "-"}</span>
              </div>
            </div>
          </div>

          {/* 고장 증상 섹션 */}
          <div className="bg-gray-50 p-4 rounded-lg border-2 border-gray-300">
            <h3 className="text-lg font-bold text-black mb-2 leading-relaxed">고장 증상</h3>
            <p className="text-base text-black whitespace-pre-wrap">{repair.issueDescription}</p>
          </div>

          {/* 수리 등록 정보 섹션 */}
          <div className="bg-amber-50 p-4 rounded-lg border-2 border-amber-300">
            <h3 className="text-lg font-bold text-black mb-3 leading-relaxed">수리 등록 정보</h3>
            <div className="grid grid-cols-2 gap-3 text-base">
              <div>
                <span className="font-semibold text-gray-700">수리 시작일:</span>
                <span className="ml-2 text-black">
                  {new Date(repair.repairStartDate).toLocaleDateString("ko-KR")}
                </span>
              </div>
              <div>
                <span className="font-semibold text-gray-700">수리 업체:</span>
                <span className="ml-2 text-black">{repair.repairVendor || "-"}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-700">수리 비용:</span>
                <span className="ml-2 text-black">
                  {repair.repairCost ? `${repair.repairCost.toLocaleString()}원` : "-"}
                </span>
              </div>
              <div>
                <span className="font-semibold text-gray-700">등록 일시:</span>
                <span className="ml-2 text-black">
                  {new Date(repair.createdAt).toLocaleString("ko-KR")}
                </span>
              </div>
            </div>
            {repair.repairNotes && (
              <div className="mt-3 pt-3 border-t border-amber-200">
                <span className="font-semibold text-gray-700">등록 시 메모:</span>
                <p className="mt-1 text-black whitespace-pre-wrap">{repair.repairNotes}</p>
              </div>
            )}
          </div>

          {/* 수리 정보 폼 */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="status" className="text-lg font-medium text-black leading-relaxed">
                수리 상태 *
              </Label>
              <Select value={status} onValueChange={(value) => setStatus(value as RepairStatus)}>
                <SelectTrigger className="text-lg border-2 border-black min-h-[44px] mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(STATUS_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key} className="text-lg">
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                  placeholder="수리 비용"
                  className="text-lg border-2 border-black min-h-[44px] mt-2"
                  min="0"
                  step="1000"
                />
              </div>

              <div>
                <Label htmlFor="repair-vendor" className="text-lg font-medium text-black leading-relaxed">
                  수리 업체
                </Label>
                <Input
                  id="repair-vendor"
                  value={repairVendor}
                  onChange={(e) => setRepairVendor(e.target.value)}
                  placeholder="수리 업체명"
                  className="text-lg border-2 border-black min-h-[44px] mt-2"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="completion-date" className="text-lg font-medium text-black leading-relaxed">
                수리 완료일
              </Label>
              <Input
                id="completion-date"
                type="date"
                value={completionDate}
                onChange={(e) => setCompletionDate(e.target.value)}
                className="text-lg border-2 border-black min-h-[44px] mt-2"
              />
            </div>

            <div>
              <Label htmlFor="memo" className="text-lg font-medium text-black leading-relaxed">
                수리 메모
              </Label>
              <Textarea
                id="memo"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="수리 진행 상황이나 메모를 입력하세요"
                className="text-lg border-2 border-black min-h-[100px] resize-none mt-2"
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
                disabled={isPending}
                className="flex-1 text-lg bg-black text-white hover:bg-gray-800 min-h-[44px]"
              >
                {isPending ? "저장 중..." : "저장"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
