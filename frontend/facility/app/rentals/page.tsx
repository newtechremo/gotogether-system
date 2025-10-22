'use client';

import { Navigation } from "@/components/navigation"
import { RentalTabs } from "@/components/rentals/rental-tabs"
import { useAggregatedDevices } from "@/lib/hooks/useDevices"
import { useCurrentRentals } from "@/lib/hooks/useRentals"
import { ProtectedRoute } from "@/lib/components/ProtectedRoute"

export default function RentalsPage() {
  const { data: devices, isLoading: devicesLoading } = useAggregatedDevices();
  const { data: currentRentals, isLoading: rentalsLoading } = useCurrentRentals();

  const isLoading = devicesLoading || rentalsLoading;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-white">
        <Navigation />

        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-black mb-2 leading-relaxed">대여/반납</h1>
            <p className="text-lg text-gray-600 leading-relaxed">보조기기 대여 및 반납 처리</p>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">로딩 중...</p>
            </div>
          ) : (
            <RentalTabs devices={devices || []} currentRentals={currentRentals || []} />
          )}
        </main>
      </div>
    </ProtectedRoute>
  )
}
