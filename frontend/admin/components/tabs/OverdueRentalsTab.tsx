"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertTriangle, Eye, EyeOff, XCircle, Filter, Loader2 } from "lucide-react";
import { useOverdueRentals, useKiosks } from "@/lib/hooks/useAdmin";
import { useForceReturnRental } from "@/lib/hooks/useKiosks";

export default function OverdueRentalsTab() {
  const { data: overdueRentals, isLoading, error, refetch } = useOverdueRentals();
  const { data: kiosks } = useKiosks();
  const forceReturnRental = useForceReturnRental();

  const [selectedKiosk, setSelectedKiosk] = useState("all");
  const [timeFilter, setTimeFilter] = useState<"all" | "24" | "48" | "72">("all");
  const [sortBy, setSortBy] = useState<"time" | "location" | "device">("time");
  const [visiblePhoneIds, setVisiblePhoneIds] = useState<Set<number>>(new Set());

  const togglePhoneVisibility = (rentalId: number) => {
    setVisiblePhoneIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(rentalId)) {
        newSet.delete(rentalId);
      } else {
        newSet.add(rentalId);
      }
      return newSet;
    });
  };

  const getSeverityBadge = (severity: "critical" | "warning") => {
    if (severity === "critical") {
      return <Badge className="bg-red-600 text-white">심각</Badge>;
    }
    return <Badge className="bg-yellow-600 text-white">주의</Badge>;
  };

  const getElapsedTimeDisplay = (hours: number) => {
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    if (days > 0) {
      return `${days}일 ${remainingHours}시간`;
    }
    return `${hours}시간`;
  };

  const handleForceReturn = async (id: number, kioskId: number, deviceName: string) => {
    if (!confirm(`${deviceName} 장비를 강제 반납 처리하시겠습니까?`)) return;

    try {
      await forceReturnRental.mutateAsync({ id, kioskId });
      refetch();
      alert("강제 반납이 완료되었습니다");
    } catch (error: any) {
      alert(error.response?.data?.error?.message || "강제 반납 중 오류가 발생했습니다");
    }
  };

  // Filter and sort rentals based on selected filters
  const filteredRentals = useMemo(() => {
    if (!overdueRentals) return [];

    // 배열 복사 후 필터링 및 정렬
    return [...overdueRentals]
      .filter((rental) => {
        // 키오스크 필터
        if (selectedKiosk !== "all" && String(rental.kioskId) !== selectedKiosk) {
          return false;
        }
        // 시간 필터
        if (timeFilter === "24" && rental.elapsedHours < 24) return false;
        if (timeFilter === "48" && rental.elapsedHours < 48) return false;
        if (timeFilter === "72" && rental.elapsedHours < 72) return false;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "time") return b.elapsedHours - a.elapsedHours;
        if (sortBy === "location") return a.location.localeCompare(b.location);
        if (sortBy === "device") return a.deviceType.localeCompare(b.deviceType);
        return 0;
      });
  }, [overdueRentals, selectedKiosk, timeFilter, sortBy]);

  // 로딩 상태 처리
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 에러 상태 처리
  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-red-600" />
          <p className="text-red-600 font-bold mb-2">데이터 로딩 실패</p>
          <p className="text-gray-600 mb-4">데이터를 불러오는 중 오류가 발생했습니다.</p>
          <Button onClick={() => refetch()} variant="outline">
            다시 시도
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-black">Go Together 장기 미반납자</h2>
        <div className="flex items-center gap-2 text-base text-gray-600">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <span>총 <strong className="text-red-600">{filteredRentals.length}</strong>건의 미반납 건</span>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Kiosk Selection */}
        <div className="space-y-2">
          <label className="text-base font-medium">Go Together 선택</label>
          <Select value={selectedKiosk} onValueChange={setSelectedKiosk}>
            <SelectTrigger className="text-base">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-base">전체</SelectItem>
              {kiosks?.map((kiosk) => (
                <SelectItem key={kiosk.id} value={kiosk.id.toString()} className="text-base">
                  {kiosk.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Time Filter */}
        <div className="space-y-2">
          <label className="text-base font-medium">경과 시간 필터</label>
          <Select value={timeFilter} onValueChange={(v) => setTimeFilter(v as any)}>
            <SelectTrigger className="text-base">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-base">전체</SelectItem>
              <SelectItem value="24" className="text-base">24시간 초과</SelectItem>
              <SelectItem value="48" className="text-base">48시간 초과</SelectItem>
              <SelectItem value="72" className="text-base">72시간 초과</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sort By */}
        <div className="space-y-2">
          <label className="text-base font-medium">정렬 기준</label>
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
            <SelectTrigger className="text-base">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="time" className="text-base">경과 시간 순</SelectItem>
              <SelectItem value="location" className="text-base">장소 순</SelectItem>
              <SelectItem value="device" className="text-base">장비 순</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Stats */}
        <div className="space-y-2">
          <label className="text-base font-medium">통계</label>
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-base text-gray-600">
              심각: <span className="font-bold text-red-600">
                {filteredRentals.filter(r => r.severity === "critical").length}
              </span> / 주의: <span className="font-bold text-yellow-600">
                {filteredRentals.filter(r => r.severity === "warning").length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Rentals List */}
      {filteredRentals.length === 0 ? (
        <Card className="border-2 border-black bg-white">
          <div className="p-12 text-center text-gray-500">
            <p className="text-lg mb-2">미반납 건이 없습니다</p>
            <p className="text-sm text-gray-400">필터 조건을 변경해보세요</p>
          </div>
        </Card>
      ) : (
        <Card className="border-2 border-black bg-white">
          <div className="overflow-x-auto">
            <table className="w-full table-fixed">
              <colgroup>
                <col style={{ width: '5%' }} />
                <col style={{ width: '14%' }} />
                <col style={{ width: '14%' }} />
                <col style={{ width: '12%' }} />
                <col style={{ width: '12%' }} />
                <col style={{ width: '12%' }} />
                <col style={{ width: '8%' }} />
                <col style={{ width: '15%' }} />
                <col style={{ width: '8%' }} />
              </colgroup>
              <thead>
                <tr className="border-b-2 border-black">
                  <th className="p-6 text-left text-lg font-semibold text-black">번호</th>
                  <th className="p-6 text-left text-lg font-semibold text-black">키오스크명</th>
                  <th className="p-6 text-left text-lg font-semibold text-black">위치</th>
                  <th className="p-6 text-left text-lg font-semibold text-black">시리얼 번호</th>
                  <th className="p-6 text-left text-lg font-semibold text-black">대여시간</th>
                  <th className="p-6 text-left text-lg font-semibold text-black">경과 시간</th>
                  <th className="p-6 text-left text-lg font-semibold text-black">심각도</th>
                  <th className="p-6 text-left text-lg font-semibold text-black">연락처</th>
                  <th className="p-6 text-center text-lg font-semibold text-black">작업</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredRentals.map((rental, index) => (
                  <tr key={rental.id} className="hover:bg-gray-50">
                    <td className="p-6 text-base">{index + 1}</td>
                    <td className="p-6 text-base font-medium">{rental.kioskName}</td>
                    <td className="p-6 text-base">
                      <div className="line-clamp-3" title={rental.location}>{rental.location}</div>
                    </td>
                    <td className="p-6 text-base">
                      <div className="line-clamp-3 whitespace-pre-line">
                        {rental.deviceName}{'\n'}
                        <span className="text-sm text-gray-600">{rental.deviceType}</span>
                      </div>
                    </td>
                    <td className="p-6 text-base">{rental.rentalTime}</td>
                    <td className="p-6 text-base">
                      <span className={rental.elapsedHours > 72 ? "text-red-600 font-bold" : "text-yellow-600 font-medium"}>
                        {getElapsedTimeDisplay(rental.elapsedHours)}
                      </span>
                    </td>
                    <td className="p-6 text-base">
                      {getSeverityBadge(rental.severity)}
                    </td>
                    <td className="p-6 text-base">
                      <div className="flex items-center gap-2">
                        <span>
                          {visiblePhoneIds.has(rental.id) ? rental.renterPhone : rental.renterPhoneMasked}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => togglePhoneVisibility(rental.id)}
                          title={visiblePhoneIds.has(rental.id) ? "연락처 숨기기" : "연락처 보기"}
                        >
                          {visiblePhoneIds.has(rental.id) ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex justify-center">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleForceReturn(rental.id, rental.kioskId, rental.deviceName)}
                          disabled={forceReturnRental.isPending}
                          className="text-sm"
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          {forceReturnRental.isPending ? "처리 중..." : "강제반납"}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
