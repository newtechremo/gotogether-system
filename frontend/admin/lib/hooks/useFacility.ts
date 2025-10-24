"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  facilityService,
  type CreateFacilityRequest,
  type UpdateFacilityRequest,
  type ResetPasswordRequest
} from "../api/facility.service";
import { toast } from "sonner";

export function useFacilities(page: number = 1, limit: number = 10, search?: string) {
  return useQuery({
    queryKey: ["facilities", page, limit, search],
    queryFn: () => facilityService.getFacilities(page, limit, search),
    staleTime: 30 * 1000,
  });
}

export function useFacility(id: number) {
  return useQuery({
    queryKey: ["facility", id],
    queryFn: () => facilityService.getFacility(id),
    enabled: !!id,
  });
}

export function useCreateFacility() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateFacilityRequest) => facilityService.createFacility(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["facilities"] });
      toast.success("시설이 등록되었습니다", {
        description: response.data.facilityName,
      });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error?.message || "시설 등록에 실패했습니다.";
      toast.error("등록 실패", {
        description: errorMessage,
      });
    },
  });
}

export function useUpdateFacility() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateFacilityRequest }) =>
      facilityService.updateFacility(id, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["facilities"] });
      queryClient.invalidateQueries({ queryKey: ["facility", response.data.id] });
      toast.success("시설 정보가 수정되었습니다", {
        description: response.data.facilityName,
      });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error?.message || "시설 수정에 실패했습니다.";
      toast.error("수정 실패", {
        description: errorMessage,
      });
    },
  });
}

export function useDeleteFacility() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => facilityService.deleteFacility(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["facilities"] });
      toast.success("시설이 삭제되었습니다");
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error?.message || "시설 삭제에 실패했습니다.";
      toast.error("삭제 실패", {
        description: errorMessage,
      });
    },
  });
}

export function useResetFacilityPassword() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ResetPasswordRequest }) =>
      facilityService.resetPassword(id, data),
    onSuccess: (response) => {
      console.log('[useFacility] onSuccess 호출됨:', { response });
      // response.data가 이미 API 응답의 data 부분
      // response.data.newPassword로 접근
      queryClient.invalidateQueries({ queryKey: ["facilities"] });
      // Toast message is handled in the modal component to show the new password
    },
    onError: (error: any) => {
      console.error('[useFacility] onError 호출됨:', { error });
      const errorMessage = error.response?.data?.error?.message || "비밀번호 재설정에 실패했습니다.";
      toast.error("재설정 실패", {
        description: errorMessage,
      });
    },
  });
}
