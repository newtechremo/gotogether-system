'use client';

import { ProtectedRoute } from "@/lib/components/ProtectedRoute";
import { Navigation } from "@/components/navigation";
import { KPICards } from "@/components/dashboard/kpi-cards";
import { CurrentRentals } from "@/components/dashboard/current-rentals";
import { InventoryStatus } from "@/components/dashboard/inventory-status";
import { useDashboardStats } from "@/lib/hooks/useStatistics";
import { useCurrentRentals } from "@/lib/hooks/useRentals";
import { useDeviceStats } from "@/lib/hooks/useDevices";

export default function DashboardPage() {
  // Fetch real-time statistics from API
  const { data: dashboardStats, isLoading: statsLoading } = useDashboardStats();
  const { data: deviceStats, isLoading: devicesLoading } = useDeviceStats();
  const { data: currentRentalsData, isLoading: rentalsLoading } = useCurrentRentals();

  const currentRentals = currentRentalsData || [];

  // Use real API data from device stats
  const totalDevices = deviceStats?.totalDevices || 0;
  const availableDevices = deviceStats?.availableDevices || 0;
  const rentedDevices = deviceStats?.rentedDevices || 0;

  // Calculate total quantity of rented devices (sum of all device quantities across all rentals)
  const currentRentalsQuantity = currentRentals.reduce((sum, rental) => {
    return sum + rental.rentalDevices.reduce((deviceSum, device) => deviceSum + device.quantity, 0);
  }, 0);
  const currentRentalsCount = dashboardStats?.currentRentals || currentRentalsQuantity;

  const todayRentals = dashboardStats?.todayRentals || 0;
  const todayReturns = dashboardStats?.todayReturns || 0;

  // Convert device stats by type to array for InventoryStatus component
  const devicesByType = deviceStats?.byType ? Object.entries(deviceStats.byType).map(([deviceType, stats]) => ({
    deviceType,
    ...stats
  })) : [];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-white">
        <Navigation />

        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-black mb-2 leading-relaxed">서울시각장애인복지시설 대시보드</h1>
            <p className="text-lg text-gray-600 leading-relaxed">대여 현황을 한눈에 확인하세요</p>
          </div>

          <KPICards
            totalDevices={totalDevices}
            currentRentals={currentRentalsCount}
            availableDevices={availableDevices}
            todayRentals={todayRentals}
            todayReturns={todayReturns}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <CurrentRentals rentals={currentRentals} />
            <InventoryStatus devices={devicesByType} isLoading={devicesLoading} />
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
