"use client";

import { useQuery } from "@tanstack/react-query";
import { adminService } from "../api/admin.service";

/**
 * 장기 미반납 목록 조회 훅
 */
export function useOverdueRentals() {
  return useQuery({
    queryKey: ["overdueRentals"],
    queryFn: async () => {
      const response = await adminService.getOverdueRentals();
      return response.data;
    },
    staleTime: 30 * 1000, // 30초
    refetchInterval: 60 * 1000, // 1분마다 자동 갱신
  });
}

/**
 * 키오스크 목록 조회 훅
 */
export function useKiosks() {
  return useQuery({
    queryKey: ["kiosks"],
    queryFn: async () => {
      const response = await adminService.getKiosks();
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5분
  });
}
