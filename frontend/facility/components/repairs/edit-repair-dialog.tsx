"use client"
import { useState, useEffect } from "react"
import type React from "react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useUpdateRepair } from "@/lib/hooks/useRepairs"
import type { FacilityRepair } from "@/lib/api/repair.service"

interface EditRepairDialogProps {
  repair: FacilityRepair | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

const DEVICE_TYPE_LABELS: Record<string, string> = {
  "AR글라스": "AR 글라스",
  "골전도 이어폰": "골전도 이어폰",
  "스마트폰": "스마트폰",
}

const STATUS_OPTIONS = [
  { value: "신고접수", label: "신고접수", color: "text-yellow-600" },
  { value: "수리중", label: "수리중", color: "text-blue-600" },
  { value: "수리완료", label: "수리완료", color: "text-green-600" },
]

export function EditRepairDialog({ repair, open, onOpenChange, onSuccess }: EditRepairDialogProps) {
  const { mutate: updateRepair, isPending } = useUpdateRepair()

  const [status, setStatus] = useState(repair?.status || "신고접수")
  const [repairMemo, setRepairMemo] = useState(repair?.repairNotes || "")

  // Update form when repair changes
  useEffect(() => {
    if (repair) {
      setStatus(repair.status)
      setRepairMemo(repair.repairNotes || "")
    }
  }, [repair])

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

  if (!repair) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    updateRepair(
      {
        id: repair.id,
        data: {
          repairStatus: status,
          repairMemo: repairMemo.trim() || undefined,
        },
      },
      {
        onSuccess: () => {
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
          <DialogTitle className="text-2xl font-bold text-black leading-relaxed">고장신고 상세 및 수정</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 상세 확인 (읽기 전용) */}
          <div className="bg-gray-50 p-6 border-2 border-gray-300 rounded-lg space-y-4">
            <h3 className="text-xl font-bold text-black mb-4">신고 내용</h3>

            <div>
              <Label className="text-base font-bold text-black">기기 종류</Label>
              <p className="text-lg text-gray-800 mt-1">
                {DEVICE_TYPE_LABELS[repair.deviceType] || repair.deviceType}
              </p>
            </div>

            <div>
              <Label className="text-base font-bold text-black">기기 코드</Label>
              <p className="text-lg text-gray-800 mt-1">{repair.deviceItem?.deviceCode || "-"}</p>
            </div>

            <div>
              <Label className="text-base font-bold text-black">고장 증상</Label>
              <p className="text-lg text-gray-800 mt-1 whitespace-pre-wrap">{repair.issueDescription}</p>
            </div>

            <div>
              <Label className="text-base font-bold text-black">신고 접수일</Label>
              <p className="text-lg text-gray-800 mt-1">
                {new Date(repair.repairStartDate).toLocaleDateString("ko-KR")}
              </p>
            </div>
          </div>

          {/* 상태 변경 */}
          <div>
            <Label htmlFor="status" className="text-lg font-bold text-black leading-relaxed">
              상태 변경 *
            </Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="text-lg border-2 border-black min-h-[44px] mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value} className="text-lg">
                    <span className={option.color}>{option.label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 수리 메모 */}
          <div>
            <Label htmlFor="repair-memo" className="text-lg font-bold text-black leading-relaxed">
              수리 메모
            </Label>
            <Textarea
              id="repair-memo"
              value={repairMemo}
              onChange={(e) => setRepairMemo(e.target.value)}
              placeholder="수리 진행 상황이나 특이사항을 입력하세요 (예: 부품 주문 완료, 3일 내 수리 예정)"
              className="text-lg border-2 border-black min-h-[120px] resize-none mt-2"
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
              disabled={isPending}
              className="flex-1 text-lg bg-black text-white hover:bg-gray-800 min-h-[48px] font-semibold"
            >
              {isPending ? "저장 중..." : "저장"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
