"use client"
import { useState, useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { EditDeviceDialog } from "./edit-device-dialog"
import { useDeleteDevice } from "@/lib/hooks/useDevices"
import type { DeviceItem } from "@/lib/api/device.service"

interface DeviceTableProps {
  devices: DeviceItem[]
}

const statusLabels = {
  available: "사용가능",
  rented: "대여중",
  broken: "고장",
  maintenance: "수리중",
}

const statusColors = {
  available: "text-green-600",
  rented: "text-blue-600",
  broken: "text-red-600",
  maintenance: "text-orange-600",
}

const deviceTypeLabels = {
  'AR글라스': 'AR글라스',
  '골전도 이어폰': '골전도 이어폰',
  '스마트폰': '스마트폰',
  '기타': '기타',
}

export function DeviceTable({ devices }: DeviceTableProps) {
  const [editingDevice, setEditingDevice] = useState<DeviceItem | null>(null)
  const [selectedDeviceType, setSelectedDeviceType] = useState<string>("전체")
  const deleteDevice = useDeleteDevice()

  // Get unique device types from devices
  const deviceTypes = useMemo(() => {
    const types = new Set(devices.map(d => d.deviceType))
    const sortedTypes = Array.from(types).sort((a, b) => {
      // Put '기타' at the end
      if (a === '기타') return 1
      if (b === '기타') return -1
      return a.localeCompare(b)
    })
    return ["전체", ...sortedTypes]
  }, [devices])

  // Filter devices by selected type
  const filteredDevices = useMemo(() => {
    if (selectedDeviceType === "전체") {
      return devices
    }
    return devices.filter(d => d.deviceType === selectedDeviceType)
  }, [devices, selectedDeviceType])

  const handleDelete = (id: number, deviceCode: string) => {
    if (confirm(`기기 "${deviceCode}"를 삭제하시겠습니까?`)) {
      deleteDevice.mutate(id)
    }
  }

  return (
    <>
      {/* Filter Tabs */}
      <div className="mb-6">
        <div className="flex gap-3 flex-wrap">
          {deviceTypes.map((type) => (
            <Button
              key={type}
              onClick={() => setSelectedDeviceType(type)}
              className={`min-h-[48px] px-8 py-3 text-lg font-semibold border-2 transition-colors ${
                selectedDeviceType === type
                  ? "bg-black text-white border-black hover:bg-gray-800"
                  : "bg-white text-black border-gray-300 hover:bg-gray-50"
              }`}
            >
              {type}
              {type !== "전체" && (
                <span className="ml-2 text-sm">
                  ({devices.filter(d => d.deviceType === type).length})
                </span>
              )}
              {type === "전체" && (
                <span className="ml-2 text-sm">({devices.length})</span>
              )}
            </Button>
          ))}
        </div>
      </div>

      <Card className="border-2 border-black bg-white">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-black">
                <th className="text-left p-6 text-lg font-semibold text-black leading-relaxed w-20">번호</th>
                <th className="text-left p-6 text-lg font-semibold text-black leading-relaxed">종류</th>
                <th className="text-left p-6 text-lg font-semibold text-black leading-relaxed">자산명</th>
                <th className="text-left p-6 text-lg font-semibold text-black leading-relaxed">시리얼 번호</th>
                <th className="text-center p-6 text-lg font-semibold text-black leading-relaxed">상태</th>
                <th className="text-center p-6 text-lg font-semibold text-black leading-relaxed">등록일</th>
                <th className="text-center p-6 text-lg font-semibold text-black leading-relaxed">수정/삭제</th>
              </tr>
            </thead>
            <tbody>
              {filteredDevices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center p-12 text-lg text-gray-600 leading-relaxed">
                    {selectedDeviceType === "전체"
                      ? "등록된 기기가 없습니다"
                      : `${selectedDeviceType} 기기가 없습니다`}
                  </td>
                </tr>
              ) : (
                filteredDevices.map((device, index) => (
                  <tr key={device.id} className="border-b border-gray-300 hover:bg-gray-50">
                    <td className="p-6 text-lg text-gray-600 leading-relaxed">{index + 1}</td>
                    <td className="p-6 text-lg text-black leading-relaxed">{device.deviceType}</td>
                    <td className="p-6 text-lg font-semibold text-black leading-relaxed">{device.deviceCode}</td>
                    <td className="p-6 text-lg text-gray-600 leading-relaxed">{device.serialNumber || "-"}</td>
                    <td className="p-6 text-center">
                      <span className={`text-lg font-semibold ${statusColors[device.status]}`}>
                        {statusLabels[device.status]}
                      </span>
                    </td>
                    <td className="p-6 text-center text-lg text-gray-600 leading-relaxed">
                      {device.registrationDate || "-"}
                    </td>
                    <td className="p-6 text-center">
                      <div className="flex gap-2 justify-center">
                        <Button
                          onClick={() => setEditingDevice(device)}
                          className="min-h-[44px] min-w-[44px] bg-black text-white hover:bg-gray-800 border-2 border-black text-lg px-6 py-3"
                        >
                          수정
                        </Button>
                        <Button
                          onClick={() => handleDelete(device.id, device.deviceCode)}
                          disabled={device.status === 'rented'}
                          className="min-h-[44px] min-w-[44px] bg-red-600 text-white hover:bg-red-700 border-2 border-red-600 text-lg px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          삭제
                        </Button>
                      </div>
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
