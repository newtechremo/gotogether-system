'use client';

import { Navigation } from "@/components/navigation"
import { HistoryTable } from "@/components/history/history-table"
import { useRentals } from "@/lib/hooks/useRentals"

export default function HistoryPage() {
  const { data: allHistory, isLoading } = useRentals();

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black mb-2 leading-relaxed">전체이력</h1>
          <p className="text-lg text-gray-600 leading-relaxed">모든 대여 및 반납 기록을 확인하세요</p>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-gray-500">로딩 중...</div>
        ) : (
          <HistoryTable history={allHistory || []} />
        )}
      </main>
    </div>
  )
}
