"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { FacilityRepair } from "@/lib/api/repair.service"
import { AddRepairDialog } from "./add-repair-dialog"
import { UpdateStatusDialog } from "./update-status-dialog"

const STATUS_LABELS = {
  "수리중": "수리중",
  "수리완료": "수리완료",
}

const STATUS_COLORS = {
  "수리중": "bg-yellow-100 text-yellow-800 border-yellow-200",
  "수리완료": "bg-green-100 text-green-800 border-green-200",
}

interface RepairTableProps {
  repairs: FacilityRepair[]
}

export function RepairTable({ repairs }: RepairTableProps) {
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [selectedRepair, setSelectedRepair] = useState<FacilityRepair | null>(null)

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex justify-between items-center">
        <div className="text-lg font-medium text-black">총 {repairs.length}건의 수리</div>
        <Button
          onClick={() => setShowAddDialog(true)}
          className="bg-black text-white hover:bg-gray-800 text-lg px-6 py-3 min-h-[44px]"
        >
          새 수리 등록
        </Button>
      </div>

      {/* Repair Reports Table */}
      <Card className="border-2 border-black">
        <CardHeader className="bg-gray-50 border-b-2 border-black">
          <CardTitle className="text-xl font-bold text-black">수리 현황</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {repairs.length === 0 ? (
            <div className="text-center py-12 text-lg text-gray-500">등록된 수리가 없습니다.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b-2 border-black">
                  <tr>
                    <th className="px-4 py-4 text-left text-lg font-bold text-black border-r border-gray-300">
                      장비 코드
                    </th>
                    <th className="px-4 py-4 text-left text-lg font-bold text-black border-r border-gray-300">
                      장비 유형
                    </th>
                    <th className="px-4 py-4 text-left text-lg font-bold text-black border-r border-gray-300">
                      수리 내용
                    </th>
                    <th className="px-4 py-4 text-left text-lg font-bold text-black border-r border-gray-300">
                      수리 상태
                    </th>
                    <th className="px-4 py-4 text-left text-lg font-bold text-black border-r border-gray-300">
                      수리 날짜
                    </th>
                    <th className="px-4 py-4 text-left text-lg font-bold text-black">관리</th>
                  </tr>
                </thead>
                <tbody>
                  {repairs.map((repair, index) => (
                    <tr
                      key={repair.id}
                      className={`border-b border-gray-200 ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
                    >
                      <td className="px-4 py-4 text-lg text-black border-r border-gray-200">
                        {repair.deviceItem?.deviceCode || "-"}
                      </td>
                      <td className="px-4 py-4 text-lg text-black border-r border-gray-200">
                        {repair.deviceItem?.deviceType || "-"}
                      </td>
                      <td className="px-4 py-4 text-lg text-black border-r border-gray-200">
                        {repair.issueDescription}
                      </td>
                      <td className="px-4 py-4 border-r border-gray-200">
                        <Badge className={`text-sm font-medium border ${STATUS_COLORS[repair.status as keyof typeof STATUS_COLORS]}`}>
                          {STATUS_LABELS[repair.status as keyof typeof STATUS_LABELS]}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 text-lg text-black border-r border-gray-200">
                        {new Date(repair.repairStartDate).toLocaleDateString("ko-KR", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                        })}
                      </td>
                      <td className="px-4 py-4">
                        <Button
                          onClick={() => setSelectedRepair(repair)}
                          variant="outline"
                          className="border-black text-black hover:bg-gray-100 text-sm px-3 py-2"
                        >
                          상태변경
                        </Button>
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
      <AddRepairDialog open={showAddDialog} onOpenChange={setShowAddDialog} />

      {selectedRepair && (
        <UpdateStatusDialog
          repair={selectedRepair}
          open={!!selectedRepair}
          onOpenChange={() => setSelectedRepair(null)}
        />
      )}
    </div>
  )
}
