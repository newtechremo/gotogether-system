"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function StatisticsPage() {
  return (
    <div className="space-y-6">
      <div className="bg-white border-2 border-black rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-2">통계</h2>
        <p className="text-gray-600">시스템 전체 통계 및 리포트를 확인할 수 있습니다.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-2 border-black">
          <CardHeader>
            <CardTitle>일일 통계</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500">일일 통계 데이터를 불러오는 중...</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-black">
          <CardHeader>
            <CardTitle>월간 통계</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500">월간 통계 데이터를 불러오는 중...</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
