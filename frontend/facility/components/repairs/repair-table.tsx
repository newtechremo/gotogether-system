"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { FacilityRepair } from "@/lib/api/repair.service"
import { AddRepairDialog } from "./add-repair-dialog"
import { EditRepairDialog } from "./edit-repair-dialog"
import { useDeleteRepair } from "@/lib/hooks/useRepairs"

const DEVICE_TYPE_LABELS: Record<string, string> = {
  "AR글라스": "AR 글라스",
  "골전도 이어폰": "골전도 이어폰",
  "스마트폰": "스마트폰",
}

const STATUS_LABELS = {
  "신고접수": "신고접수",
  "수리중": "수리중",
  "수리완료": "수리완료",
}

const STATUS_COLORS = {
  "신고접수": "bg-yellow-100 text-yellow-800 border-yellow-200",
  "수리중": "bg-blue-100 text-blue-800 border-blue-200",
  "수리완료": "bg-green-100 text-green-800 border-green-200",
}

interface RepairTableProps {
  repairs: FacilityRepair[]
}

export function RepairTable({ repairs }: RepairTableProps) {
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingRepair, setEditingRepair] = useState<FacilityRepair | null>(null)
  const { mutate: deleteRepair } = useDeleteRepair()

  const handleDelete = (repair: FacilityRepair) => {
    if (confirm(`정말 "${repair.deviceItem?.deviceCode}" 기기의 고장신고를 삭제하시겠습니까?`)) {
      deleteRepair(repair.id)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex justify-between items-center">
        <div className="text-lg font-semibold text-black leading-relaxed">총 {repairs.length}건의 고장신고</div>
        <Button
          onClick={() => setShowAddDialog(true)}
          className="bg-black text-white hover:bg-gray-800 text-lg px-6 py-3 min-h-[44px] font-semibold"
        >
          고장신고 접수
        </Button>
      </div>

      {/* Repair Reports Table */}
      <Card className="border-2 border-black">
        <CardHeader className="bg-gray-50 border-b-2 border-black">
          <CardTitle className="text-xl font-bold text-black leading-relaxed">고장신고 현황</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {repairs.length === 0 ? (
            <div className="text-center py-12 text-lg text-gray-500">등록된 고장신고가 없습니다.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b-2 border-black">
                  <tr>
                    <th className="px-6 py-4 text-left text-lg font-bold text-black border-r border-gray-300 w-20">
                      번호
                    </th>
                    <th className="px-6 py-4 text-left text-lg font-bold text-black border-r border-gray-300">
                      기기 종류
                    </th>
                    <th className="px-6 py-4 text-left text-lg font-bold text-black border-r border-gray-300">
                      기기 코드
                    </th>
                    <th className="px-6 py-4 text-left text-lg font-bold text-black border-r border-gray-300">
                      고장 증상
                    </th>
                    <th className="px-6 py-4 text-center text-lg font-bold text-black border-r border-gray-300">
                      상태
                    </th>
                    <th className="px-6 py-4 text-center text-lg font-bold text-black border-r border-gray-300">
                      신고일
                    </th>
                    <th className="px-6 py-4 text-center text-lg font-bold text-black">관리</th>
                  </tr>
                </thead>
                <tbody>
                  {repairs.map((repair, index) => (
                    <tr
                      key={repair.id}
                      className={`border-b border-gray-200 hover:bg-gray-50 ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50"
                      }`}
                    >
                      <td className="px-6 py-4 text-lg text-gray-600 border-r border-gray-200">
                        {repairs.length - index}
                      </td>
                      <td className="px-6 py-4 text-lg text-black border-r border-gray-200">
                        {DEVICE_TYPE_LABELS[repair.deviceType] || repair.deviceType}
                      </td>
                      <td className="px-6 py-4 text-lg font-semibold text-black border-r border-gray-200">
                        {repair.deviceItem?.deviceCode || "-"}
                      </td>
                      <td className="px-6 py-4 text-base text-gray-700 border-r border-gray-200 max-w-md">
                        <div className="line-clamp-2" title={repair.issueDescription}>
                          {repair.issueDescription}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center border-r border-gray-200">
                        <Badge
                          className={`${
                            STATUS_COLORS[repair.status as keyof typeof STATUS_COLORS]
                          } text-base font-semibold px-3 py-1`}
                        >
                          {STATUS_LABELS[repair.status as keyof typeof STATUS_LABELS] || repair.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-center text-base text-gray-700 border-r border-gray-200">
                        {new Date(repair.repairStartDate).toLocaleDateString("ko-KR")}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex gap-2 justify-center">
                          <Button
                            onClick={() => setEditingRepair(repair)}
                            className="bg-black text-white hover:bg-gray-800 text-base px-4 py-2 min-h-[40px] font-semibold"
                          >
                            상세
                          </Button>
                          <Button
                            onClick={() => handleDelete(repair)}
                            disabled={repair.status === "수리완료"}
                            className="bg-red-600 text-white hover:bg-red-700 text-base px-4 py-2 min-h-[40px] font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                            title={repair.status === "수리완료" ? "수리완료된 신고는 삭제할 수 없습니다" : ""}
                          >
                            삭제
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <AddRepairDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSuccess={() => {
          // Refresh will be handled by React Query
        }}
      />

      <EditRepairDialog
        repair={editingRepair}
        open={!!editingRepair}
        onOpenChange={(open) => {
          if (!open) setEditingRepair(null)
        }}
        onSuccess={() => {
          // Refresh will be handled by React Query
        }}
      />
    </div>
  )
}
