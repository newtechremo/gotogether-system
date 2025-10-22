"use client"
import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import type { Device, DeviceType } from "@/lib/database"

interface InventoryStatusProps {
  devices: Device[]
}

const deviceTypeLabels = {
  AR_GLASSES: "AR 글라스",
  BONE_HEADSET: "골전도 이어폰",
  SMARTPHONE: "스마트폰",
}

export function InventoryStatus({ devices }: InventoryStatusProps) {
  const router = useRouter()
  const [isNavigating, setIsNavigating] = useState(false)

  // Group devices by type and sum quantities
  const inventoryByType = devices.reduce(
    (acc, device) => {
      const type = device.type
      if (!acc[type]) {
        acc[type] = { total: 0, available: 0, rented: 0 }
      }
      acc[type].total += device.qty_total
      acc[type].available += device.qty_available
      acc[type].rented += device.qty_total - device.qty_available
      return acc
    },
    {} as Record<string, { total: number; available: number; rented: number }>,
  )

  const handleDeviceTypeClick = (deviceType: DeviceType) => {
    setIsNavigating(true)
    router.push(`/rentals?tab=rent&deviceType=${deviceType}`)
  }

  return (
    <>
      <Card className="p-6 border-2 border-black bg-white">
        <h3 className="text-xl font-semibold text-black mb-4 leading-relaxed">재고 현황 (종류별)</h3>

        <div className="space-y-4">
          {Object.entries(inventoryByType).map(([type, stats]) => (
            <div key={type} className="p-4 border border-gray-300 rounded-lg bg-gray-50 relative">
              <div className="flex justify-between items-center mb-2">
                <div className="font-semibold text-lg text-black leading-relaxed">
                  {deviceTypeLabels[type as keyof typeof deviceTypeLabels]}
                </div>
                <div className="flex items-center gap-2">
                  {stats.available === 0 && (
                    <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold">품절</span>
                  )}
                  <Button
                    onClick={() => handleDeviceTypeClick(type as DeviceType)}
                    disabled={stats.available === 0 || isNavigating}
                    className="bg-black text-white hover:bg-gray-800 border-2 border-black text-sm font-semibold px-3 py-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isNavigating ? "이동 중..." : "대여"}
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-base leading-relaxed">
                <div>
                  <span className="text-gray-600">총 보유:</span>
                  <span className="font-semibold text-black ml-2">{stats.total}</span>
                </div>
                <div>
                  <span className="text-gray-600">대여중:</span>
                  <span className="font-semibold text-black ml-2">{stats.rented}</span>
                </div>
                <div>
                  <span className="text-gray-600">대여가능:</span>
                  <span className="font-semibold text-black ml-2">{stats.available}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </>
  )
}
