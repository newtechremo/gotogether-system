'use client';

import { Navigation } from "@/components/navigation"
import { DeviceTable } from "@/components/devices/device-table"
import { AddDeviceButton } from "@/components/devices/add-device-button"
import { useDevices } from "@/lib/hooks/useDevices"
import { ProtectedRoute } from "@/lib/components/ProtectedRoute"

export default function DevicesPage() {
  const { data: devices, isLoading } = useDevices();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-white">
        <Navigation />

        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-black mb-2 leading-relaxed">기기관리</h1>
              <p className="text-lg text-gray-600 leading-relaxed">보조기기 등록 및 수량 관리</p>
            </div>
            <AddDeviceButton />
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">로딩 중...</p>
            </div>
          ) : (
            <DeviceTable devices={devices || []} />
          )}
        </main>
      </div>
    </ProtectedRoute>
  )
}
