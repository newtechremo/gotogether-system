"use client"
import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

interface DeviceTypeStats {
  deviceType: string;
  total: number;
  available: number;
  rented: number;
  broken: number;
  maintenance: number;
}

interface InventoryStatusProps {
  devices: DeviceTypeStats[];
  isLoading?: boolean;
}

export function InventoryStatus({ devices, isLoading }: InventoryStatusProps) {
  const router = useRouter()
  const [loadingDeviceType, setLoadingDeviceType] = useState<string | null>(null)

  const handleDeviceTypeClick = (deviceType: string) => {
    setLoadingDeviceType(deviceType)
    router.push(`/rentals?tab=rent&deviceType=${encodeURIComponent(deviceType)}`)
  }

  if (isLoading) {
    return (
      <Card className="p-6 border-2 border-black bg-white">
        <h3 className="text-xl font-semibold text-black mb-4 leading-relaxed">재고 현황 (종류별)</h3>
        <div className="text-center py-8">
          <p className="text-gray-500">로딩 중...</p>
        </div>
      </Card>
    )
  }

  return (
    <>
      <Card className="p-6 border-2 border-black bg-white">
        <h3 className="text-xl font-semibold text-black mb-4 leading-relaxed">재고 현황 (종류별)</h3>

        {devices.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">등록된 기기가 없습니다</p>
          </div>
        ) : (
          <div className="space-y-3">
            {devices.map((device) => (
              <div key={device.deviceType} className="p-4 border-2 border-black rounded-lg bg-white">
                {/* First row: Device Type and Action Button */}
                <div className="flex items-center justify-between mb-3">
                  <div className="font-bold text-xl text-black leading-relaxed">
                    {device.deviceType}
                  </div>
                  <Button
                    onClick={() => handleDeviceTypeClick(device.deviceType)}
                    disabled={device.available === 0 || loadingDeviceType !== null}
                    className="bg-black text-white hover:bg-gray-800 border-2 border-black text-base font-semibold px-4 py-2 min-h-[40px] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loadingDeviceType === device.deviceType ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        로딩 중...
                      </>
                    ) : (
                      "대여"
                    )}
                  </Button>
                </div>

                {/* Second row: Stats */}
                <div className="flex items-center gap-8">
                  <div className="flex flex-col">
                    <span className="text-gray-600 text-base mb-1">총</span>
                    <span className="font-bold text-2xl text-black">{device.total}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-600 text-base mb-1">가능</span>
                    <span className="font-bold text-2xl text-green-600">{device.available}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-600 text-base mb-1">대여중</span>
                    <span className="font-bold text-2xl text-blue-600">{device.rented}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-600 text-base mb-1">고장</span>
                    <span className="font-bold text-2xl text-red-600">{device.broken + device.maintenance}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </>
  )
}
