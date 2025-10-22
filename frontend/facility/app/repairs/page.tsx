'use client';

import { Navigation } from "@/components/navigation"
import { RepairTable } from "@/components/repairs/repair-table"
import { useRepairs } from "@/lib/hooks/useRepairs"
import { ProtectedRoute } from "@/lib/components/ProtectedRoute"

export default function RepairsPage() {
  const { data: repairs, isLoading } = useRepairs();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-white">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-black mb-2">고장신고 관리</h2>
            <p className="text-lg text-gray-700">기기 고장 신고 접수 및 수리 현황을 관리합니다.</p>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">로딩 중...</p>
            </div>
          ) : (
            <RepairTable repairs={repairs || []} />
          )}
        </main>
      </div>
    </ProtectedRoute>
  )
}
