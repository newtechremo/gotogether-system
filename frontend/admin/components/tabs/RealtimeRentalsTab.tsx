"use client";

import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Clock, Calendar } from "lucide-react";
import { useKiosks, type Kiosk } from "@/lib/hooks/useKiosks";
import { useRouter } from "next/navigation";

export default function RealtimeRentalsTab() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);

  // 모든 키오스크 가져오기 (limit을 크게 설정, 선택된 날짜 전달)
  const { data: kiosksData, isLoading } = useKiosks(1, 100, selectedDate);

  // 키오스크 상태 뱃지
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800 border-green-300">운영중</Badge>;
      case "inactive":
        return <Badge className="bg-gray-100 text-gray-800 border-gray-300">비활성</Badge>;
      case "maintenance":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">점검중</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // 장비 타입별 통계 계산
  const calculateDeviceStats = (kiosk: Kiosk) => {
    const devices = kiosk.devices || [];

    const stats = {
      arGlass: { total: 0, rented: 0 },
      boneConduction: { total: 0, rented: 0 },
      smartphone: { total: 0, rented: 0 },
    };

    devices.forEach((device: any) => {
      const isRented = device.status === "rented";

      switch (device.deviceType) {
        case "AR_GLASS":
          stats.arGlass.total++;
          if (isRented) stats.arGlass.rented++;
          break;
        case "BONE_CONDUCTION":
          stats.boneConduction.total++;
          if (isRented) stats.boneConduction.rented++;
          break;
        case "SMARTPHONE":
          stats.smartphone.total++;
          if (isRented) stats.smartphone.rented++;
          break;
      }
    });

    return stats;
  };

  // 키오스크 행 클릭 핸들러
  const handleKioskClick = (kioskId: number) => {
    router.push(`/kiosks/${kioskId}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-medium">로딩 중...</p>
        </div>
      </div>
    );
  }

  const kiosks = kiosksData?.items || [];

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-black">Go Together 실시간 대여 현황</h2>
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-gray-500" />
          <Label htmlFor="date-filter" className="text-base font-medium">조회 날짜:</Label>
          <Input
            id="date-filter"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-auto text-base"
          />
        </div>
      </div>

      {/* 키오스크 목록 테이블 */}
      {kiosks.length === 0 ? (
        <Card className="border-2 border-black bg-white">
          <div className="p-12 text-center text-gray-500">
            <p className="text-lg mb-2">등록된 키오스크가 없습니다</p>
            <p className="text-sm text-gray-400">Go Together 관리 탭에서 키오스크를 등록하세요</p>
          </div>
        </Card>
      ) : (
        <Card className="border-2 border-black bg-white">
          <div className="overflow-x-auto">
            <table className="w-full table-fixed">
              <colgroup>
                <col style={{ width: '6%' }} />
                <col style={{ width: '15%' }} />
                <col style={{ width: '24%' }} />
                <col style={{ width: '13%' }} />
                <col style={{ width: '15%' }} />
                <col style={{ width: '14%' }} />
                <col style={{ width: '13%' }} />
              </colgroup>
              <thead className="bg-gray-50 border-b-2 border-black">
                <tr>
                  <th className="px-3 py-6 text-center text-lg font-semibold text-gray-900">번호</th>
                  <th className="px-4 py-6 text-center text-lg font-semibold text-gray-900">이름</th>
                  <th className="px-4 py-6 text-center text-lg font-semibold text-gray-900">위치</th>
                  <th className="px-4 py-6 text-center text-lg font-semibold text-gray-900">AR 글라스</th>
                  <th className="px-4 py-6 text-center text-lg font-semibold text-gray-900">골전도 이어폰</th>
                  <th className="px-4 py-6 text-center text-lg font-semibold text-gray-900">스마트폰</th>
                  <th className="px-4 py-6 text-center text-lg font-semibold text-gray-900">상태</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {kiosks.map((kiosk, index) => {
                  const stats = calculateDeviceStats(kiosk);
                  return (
                    <tr
                      key={kiosk.id}
                      onClick={() => handleKioskClick(kiosk.id)}
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <td className="px-3 py-4 text-center text-base text-gray-600">{index + 1}</td>
                      <td className="px-4 py-4 text-center text-base font-medium text-gray-900">{kiosk.name}</td>
                      <td className="px-4 py-4 text-center text-base text-gray-600">{kiosk.location}</td>
                      <td className="px-4 py-4 text-center">
                        <span className={`text-base font-medium ${stats.arGlass.rented > 0 ? "text-blue-600" : "text-gray-600"}`}>
                          {stats.arGlass.rented}
                        </span>
                        <span className="text-base text-gray-400 mx-1">/</span>
                        <span className="text-base text-gray-600">{stats.arGlass.total}</span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className={`text-base font-medium ${stats.boneConduction.rented > 0 ? "text-blue-600" : "text-gray-600"}`}>
                          {stats.boneConduction.rented}
                        </span>
                        <span className="text-base text-gray-400 mx-1">/</span>
                        <span className="text-base text-gray-600">{stats.boneConduction.total}</span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className={`text-base font-medium ${stats.smartphone.rented > 0 ? "text-blue-600" : "text-gray-600"}`}>
                          {stats.smartphone.rented}
                        </span>
                        <span className="text-base text-gray-400 mx-1">/</span>
                        <span className="text-base text-gray-600">{stats.smartphone.total}</span>
                      </td>
                      <td className="px-4 py-4 text-center">{getStatusBadge(kiosk.status)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* 안내 메시지 */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <p className="text-base font-medium text-blue-900 mb-2">실시간 대여 현황 안내</p>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• 각 키오스크를 클릭하면 상세 정보를 확인할 수 있습니다</li>
              <li>• 대여/전체 형식으로 현재 대여 중인 장비 수를 표시합니다</li>
              <li>• 파란색 숫자는 현재 대여 중인 장비가 있음을 나타냅니다</li>
              <li>• 날짜를 변경하여 특정 날짜의 대여 현황을 조회할 수 있습니다 (향후 지원 예정)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
