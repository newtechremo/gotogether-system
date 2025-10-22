"use client"
import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { EditDeviceDialog } from "./edit-device-dialog"
import type { FacilityDevice } from "@/lib/api/device.service"

interface DeviceTableProps {
  devices: FacilityDevice[]
}

export function DeviceTable({ devices }: DeviceTableProps) {
  const [editingDevice, setEditingDevice] = useState<FacilityDevice | null>(null)

  return (
    <>
      <Card className="border-2 border-black bg-white">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-black">
                <th className="text-left p-6 text-lg font-semibold text-black leading-relaxed">종류</th>
                <th className="text-left p-6 text-lg font-semibold text-black leading-relaxed">메모</th>
                <th className="text-center p-6 text-lg font-semibold text-black leading-relaxed">전체 수량</th>
                <th className="text-center p-6 text-lg font-semibold text-black leading-relaxed">대여중</th>
                <th className="text-center p-6 text-lg font-semibold text-black leading-relaxed">고장수량</th>
                <th className="text-center p-6 text-lg font-semibold text-black leading-relaxed">가능 수량</th>
                <th className="text-center p-6 text-lg font-semibold text-black leading-relaxed">액션</th>
              </tr>
            </thead>
            <tbody>
              {devices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center p-12 text-lg text-gray-600 leading-relaxed">
                    등록된 기기가 없습니다
                  </td>
                </tr>
              ) : (
                devices.map((device) => (
                  <tr key={device.id} className="border-b border-gray-300 hover:bg-gray-50">
                    <td className="p-6 text-lg text-black leading-relaxed">{device.deviceType}</td>
                    <td className="p-6 text-lg text-black leading-relaxed">{device.memo || "-"}</td>
                    <td className="p-6 text-center text-lg font-semibold text-black leading-relaxed">
                      {device.qtyTotal}
                    </td>
                    <td className="p-6 text-center text-lg font-semibold text-black leading-relaxed">
                      {device.qtyRented}
                    </td>
                    <td className="p-6 text-center text-lg font-semibold leading-relaxed">
                      <span className={device.qtyBroken > 0 ? "text-red-600" : "text-black"}>{device.qtyBroken}</span>
                      {device.qtyBroken > 0 && (
                        <span className="ml-2 bg-red-600 text-white px-2 py-1 rounded text-sm font-semibold">고장</span>
                      )}
                    </td>
                    <td className="p-6 text-center text-lg font-semibold leading-relaxed">
                      <span className={device.qtyAvailable === 0 ? "text-red-600" : "text-black"}>
                        {device.qtyAvailable}
                      </span>
                      {device.qtyAvailable === 0 && (
                        <span className="ml-2 bg-red-600 text-white px-2 py-1 rounded text-sm font-semibold">품절</span>
                      )}
                    </td>
                    <td className="p-6 text-center">
                      <Button
                        onClick={() => setEditingDevice(device)}
                        className="min-h-[44px] min-w-[44px] bg-black text-white hover:bg-gray-800 border-2 border-black text-lg px-6 py-3"
                      >
                        수정
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {editingDevice && <EditDeviceDialog device={editingDevice} onClose={() => setEditingDevice(null)} />}
    </>
  )
}
