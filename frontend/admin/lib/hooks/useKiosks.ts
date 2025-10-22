import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../api/client";

// 키오스크 위치 인터페이스
export interface Kiosk {
  id: number;
  name: string;
  location: string;
  managerName?: string;
  managerPhone?: string;
  installationDate?: string | null;
  status: "active" | "inactive" | "maintenance";
  notes?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  deviceCount?: number;
  availableDeviceCount?: number;
  devices?: any[];
  examinations?: KioskExamination[];
}

// 키오스크 점검 인터페이스
export interface KioskExamination {
  id: number;
  kioskId: number;
  examinationDate: string;
  result: "pass" | "fail" | "pending";
  status: "normal" | "warning" | "critical";
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface KiosksListResponse {
  items: Kiosk[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * 키오스크 위치 목록 조회
 */
export function useKiosks(page: number = 1, limit: number = 10, date?: string) {
  return useQuery({
    queryKey: ["kiosks", "locations", page, limit, date],
    queryFn: async () => {
      const response = await apiClient.get<{ success: boolean; data: KiosksListResponse }>(
        "/admin/kiosks/locations",
        { params: { page, limit, date } }
      );
      return response.data.data;
    },
    staleTime: 1000 * 60, // 1분간 캐시
  });
}

/**
 * 키오스크 상세 조회
 */
export function useKiosk(id: number) {
  return useQuery({
    queryKey: ["kiosks", "locations", id],
    queryFn: async () => {
      const response = await apiClient.get<{ success: boolean; data: Kiosk }>(
        `/admin/kiosks/locations/${id}`
      );
      return response.data.data;
    },
    enabled: !!id,
  });
}

/**
 * 키오스크 위치 생성
 */
export function useCreateKiosk() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      name: string;
      location: string;
      managerName?: string;
      managerPhone?: string;
      installationDate?: string;
      status?: "active" | "inactive" | "maintenance";
      notes?: string;
    }) => {
      const response = await apiClient.post<{ success: boolean; data: Kiosk }>(
        "/admin/kiosks/locations",
        data
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kiosks", "locations"] });
    },
  });
}

/**
 * 키오스크 위치 수정
 */
export function useUpdateKiosk() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: {
      id: number;
      name?: string;
      location?: string;
      managerName?: string;
      managerPhone?: string;
      installationDate?: string;
      status?: "active" | "inactive" | "maintenance";
      notes?: string;
    }) => {
      const response = await apiClient.put<{ success: boolean; data: Kiosk }>(
        `/admin/kiosks/locations/${id}`,
        data
      );
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["kiosks", "locations"] });
      queryClient.invalidateQueries({ queryKey: ["kiosks", "locations", variables.id] });
    },
  });
}

/**
 * 키오스크 위치 삭제
 */
export function useDeleteKiosk() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await apiClient.delete<{ success: boolean; data: { message: string } }>(
        `/admin/kiosks/locations/${id}`
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kiosks", "locations"] });
    },
  });
}

/**
 * 키오스크 점검 기록 목록 조회
 */
export function useKioskExaminations(kioskId: number) {
  return useQuery({
    queryKey: ["kiosks", "locations", kioskId, "examinations"],
    queryFn: async () => {
      const response = await apiClient.get<{ success: boolean; data: KioskExamination[] }>(
        `/admin/kiosks/locations/${kioskId}/examinations`
      );
      return response.data.data;
    },
    enabled: !!kioskId,
  });
}

/**
 * 키오스크 점검 기록 생성
 */
export function useCreateExamination() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      kioskId,
      ...data
    }: {
      kioskId: number;
      examinationDate: string;
      result?: "pass" | "fail" | "pending";
      status?: "normal" | "warning" | "critical";
      notes?: string;
    }) => {
      const response = await apiClient.post<{ success: boolean; data: KioskExamination }>(
        `/admin/kiosks/locations/${kioskId}/examinations`,
        data
      );
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["kiosks", "locations", variables.kioskId, "examinations"] });
      queryClient.invalidateQueries({ queryKey: ["kiosks", "locations", variables.kioskId] });
    },
  });
}

/**
 * 키오스크 점검 기록 수정
 */
export function useUpdateExamination() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      kioskId,
      ...data
    }: {
      id: number;
      kioskId: number;
      examinationDate?: string;
      result?: "pass" | "fail" | "pending";
      status?: "normal" | "warning" | "critical";
      notes?: string;
    }) => {
      const response = await apiClient.put<{ success: boolean; data: KioskExamination }>(
        `/admin/kiosks/examinations/${id}`,
        data
      );
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["kiosks", "locations", variables.kioskId, "examinations"] });
    },
  });
}

/**
 * 키오스크 점검 기록 삭제
 */
export function useDeleteExamination() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, kioskId }: { id: number; kioskId: number }) => {
      const response = await apiClient.delete<{ success: boolean; data: { message: string } }>(
        `/admin/kiosks/examinations/${id}`
      );
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["kiosks", "locations", variables.kioskId, "examinations"] });
    },
  });
}

// ===== 키오스크 장비 관리 =====

export interface KioskDevice {
  id: number;
  kioskId: number;
  deviceType: "AR_GLASS" | "BONE_CONDUCTION" | "SMARTPHONE";
  serialNumber: string;
  boxNumber: number;
  status: "available" | "rented" | "maintenance" | "broken";
  nfcTagId?: string;
  purchaseDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * 키오스크 장비 목록 조회
 */
export function useKioskDevices(kioskId: number) {
  return useQuery({
    queryKey: ["kiosks", "locations", kioskId, "devices"],
    queryFn: async () => {
      const response = await apiClient.get<{ success: boolean; data: KioskDevice[] }>(
        `/admin/kiosks/locations/${kioskId}/devices`
      );
      return response.data.data;
    },
    enabled: !!kioskId,
  });
}

/**
 * 키오스크 장비 등록
 */
export function useCreateKioskDevice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      kioskId,
      ...data
    }: {
      kioskId: number;
      deviceType: "AR_GLASS" | "BONE_CONDUCTION" | "SMARTPHONE";
      serialNumber: string;
      boxNumber: number;
      nfcTagId?: string;
      purchaseDate?: string;
      notes?: string;
    }) => {
      const response = await apiClient.post<{ success: boolean; data: KioskDevice }>(
        `/admin/kiosks/locations/${kioskId}/devices`,
        data
      );
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["kiosks", "locations", variables.kioskId, "devices"] });
      queryClient.invalidateQueries({ queryKey: ["kiosks", "locations", variables.kioskId] });
      queryClient.invalidateQueries({ queryKey: ["kiosks", "locations"] });
    },
  });
}

/**
 * 키오스크 장비 수정
 */
export function useUpdateKioskDevice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      kioskId,
      ...data
    }: {
      id: number;
      kioskId: number;
      deviceType?: "AR_GLASS" | "BONE_CONDUCTION" | "SMARTPHONE";
      serialNumber?: string;
      boxNumber?: number;
      status?: "available" | "rented" | "maintenance" | "broken";
      nfcTagId?: string;
      purchaseDate?: string;
      notes?: string;
    }) => {
      const response = await apiClient.put<{ success: boolean; data: KioskDevice }>(
        `/admin/kiosks/devices/${id}`,
        data
      );
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["kiosks", "locations", variables.kioskId, "devices"] });
      queryClient.invalidateQueries({ queryKey: ["kiosks", "locations", variables.kioskId] });
    },
  });
}

/**
 * 키오스크 장비 삭제
 */
export function useDeleteKioskDevice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, kioskId }: { id: number; kioskId: number }) => {
      const response = await apiClient.delete<{ success: boolean; data: { message: string } }>(
        `/admin/kiosks/devices/${id}`
      );
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["kiosks", "locations", variables.kioskId, "devices"] });
      queryClient.invalidateQueries({ queryKey: ["kiosks", "locations", variables.kioskId] });
    },
  });
}

// ===== 키오스크 대여 관리 =====

export interface KioskRental {
  id: number;
  rentalNumber: string;
  deviceId: number;
  deviceSerial: string;
  deviceType: string;
  deviceName: string;
  boxNumber: number;
  status: "rented" | "returned" | "overdue";
  renterName: string;
  renterPhone: string;
  renterPhoneMasked: string;
  rentalDatetime: string;
  expectedReturnDatetime: string;
  actualReturnDatetime?: string;
  notes?: string;
}

/**
 * 특정 키오스크의 대여 목록 조회
 */
export function useKioskRentals(kioskId: number) {
  return useQuery({
    queryKey: ["kiosks", "locations", kioskId, "rentals"],
    queryFn: async () => {
      const response = await apiClient.get<{ success: boolean; data: KioskRental[] }>(
        `/admin/kiosks/locations/${kioskId}/rentals`
      );
      return response.data.data;
    },
    enabled: !!kioskId,
  });
}

/**
 * 대여 강제 반납
 */
export function useForceReturnRental() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, kioskId }: { id: number; kioskId: number }) => {
      const response = await apiClient.post<{ success: boolean; data: any }>(
        `/admin/kiosks/rentals/${id}/force-return`,
        {}
      );
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["kiosks", "locations", variables.kioskId, "rentals"] });
      queryClient.invalidateQueries({ queryKey: ["kiosks", "locations", variables.kioskId, "devices"] });
      queryClient.invalidateQueries({ queryKey: ["kiosks", "rentals", "current"] });
    },
  });
}
