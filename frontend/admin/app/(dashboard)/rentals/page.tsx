"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function RentalsPage() {
  return (
    <div className="space-y-6">
      <div className="bg-white border-2 border-black rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-2">대여 현황</h2>
        <p className="text-gray-600">실시간 대여 및 반납 현황을 확인할 수 있습니다.</p>
      </div>

      <Card className="border-2 border-black">
        <CardHeader>
          <CardTitle>대여 현황 목록</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">대여 현황 데이터를 불러오는 중...</p>
        </CardContent>
      </Card>
    </div>
  );
}
