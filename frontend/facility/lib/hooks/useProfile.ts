"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  profileService,
  type FacilityProfile,
  type UpdateProfileRequest,
  type ChangePasswordRequest,
} from "../api/profile.service";
import { toast } from "sonner";

export function useProfile() {
  return useQuery<FacilityProfile>({
    queryKey: ["facility-profile"],
    queryFn: async () => {
      const response = await profileService.getProfile();
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfileRequest) => profileService.updateProfile(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["facility-profile"] });
      queryClient.invalidateQueries({ queryKey: ["current-user"] });
      toast.success("프로필 수정 성공", {
        description: response.data.message || "프로필이 성공적으로 수정되었습니다.",
      });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error?.message || "프로필 수정에 실패했습니다.";
      toast.error("프로필 수정 실패", {
        description: errorMessage,
      });
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (data: ChangePasswordRequest) => profileService.changePassword(data),
    onSuccess: (response) => {
      toast.success("비밀번호 변경 성공", {
        description: response.data.message || "비밀번호가 성공적으로 변경되었습니다.",
      });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error?.message || "비밀번호 변경에 실패했습니다.";
      toast.error("비밀번호 변경 실패", {
        description: errorMessage,
      });
    },
  });
}
