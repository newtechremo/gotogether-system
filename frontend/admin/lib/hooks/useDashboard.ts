import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../api/client";

// 대시보드 통계 타입
export interface DashboardStats {
  totalKiosks: number;
  totalFacilities: number;
  todayRentals: number;
  overdueRentals: number;
}

// 최근 대여 항목 타입
export interface RecentRental {
  id: number;
  location: string;
  status: "rented" | "returned" | "overdue";
  timestamp: string;
}

// 장비 현황 타입
export interface EquipmentStatus {
  type: string;
  rented: number;
  total: number;
}

/**
 * 대시보드 KPI 데이터 조회
 */
export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: async () => {
      // TODO: 실제 API 엔드포인트로 교체 필요
      // const response = await apiClient.get<DashboardStats>("/admin/dashboard/stats");

      // 현재는 시설 수만 실제 API로 가져오기
      const facilitiesResponse = await apiClient.get("/facilities", {
        params: { page: 1, limit: 1000 }
      });

      const stats: DashboardStats = {
        totalKiosks: 15, // TODO: 키오스크 API 구현 후 교체
        totalFacilities: facilitiesResponse.data.data?.total || 0,
        todayRentals: 45, // TODO: 통계 API 구현 후 교체
        overdueRentals: 3, // TODO: 연체 API 구현 후 교체
      };

      return stats;
    },
    staleTime: 1000 * 60 * 5, // 5분간 캐시 유지
  });
}

/**
 * 최근 대여 목록 조회
 */
export function useRecentRentals() {
  return useQuery({
    queryKey: ["dashboard", "recent-rentals"],
    queryFn: async () => {
      // TODO: 실제 API 엔드포인트로 교체 필요
      // const response = await apiClient.get<RecentRental[]>("/admin/rentals/recent");

      // 임시 목업 데이터
      const recentRentals: RecentRental[] = [
        { id: 1, location: "서울 메가박스", status: "rented", timestamp: new Date().toISOString() },
        { id: 2, location: "부산 롯데시네마", status: "rented", timestamp: new Date().toISOString() },
        { id: 3, location: "대구 CGV", status: "returned", timestamp: new Date().toISOString() },
      ];

      return recentRentals;
    },
    staleTime: 1000 * 60, // 1분간 캐시 유지
  });
}

/**
 * 장비 현황 조회
 */
export function useEquipmentStatus() {
  return useQuery({
    queryKey: ["dashboard", "equipment-status"],
    queryFn: async () => {
      // TODO: 실제 API 엔드포인트로 교체 필요
      // const response = await apiClient.get<EquipmentStatus[]>("/admin/equipment/status");

      // 임시 목업 데이터
      const equipmentStatus: EquipmentStatus[] = [
        { type: "AR 글라스", rented: 25, total: 30 },
        { type: "골전도 이어폰", rented: 15, total: 20 },
        { type: "스마트폰", rented: 8, total: 15 },
      ];

      return equipmentStatus;
    },
    staleTime: 1000 * 60 * 5, // 5분간 캐시 유지
  });
}
