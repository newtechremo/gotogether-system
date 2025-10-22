"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authService, type LoginRequest, type FacilityUser } from "../api/auth.service";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function useLogin() {
  const router = useRouter();

  return useMutation({
    mutationFn: (credentials: LoginRequest) => authService.login(credentials),
    onSuccess: (response) => {
      authService.saveToken(response.data.access_token);
      authService.saveUser(response.data.user);
      toast.success("로그인 성공", {
        description: `${response.data.user.facilityName}에 오신 것을 환영합니다!`,
      });
      router.push("/");
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error?.message || "로그인에 실패했습니다.";
      toast.error("로그인 실패", {
        description: errorMessage,
      });
    },
  });
}

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      queryClient.clear();
      router.push("/login");
      toast.success("로그아웃되었습니다");
    },
  });
}

export function useCurrentUser() {
  return useQuery<FacilityUser | null>({
    queryKey: ["current-user"],
    queryFn: async () => {
      try {
        const response = await authService.getCurrentUser();
        return response.data;
      } catch {
        return null;
      }
    },
    enabled: authService.isAuthenticated(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useAuthStatus() {
  const { data: user, isLoading } = useCurrentUser();
  return {
    isAuthenticated: !!user,
    isLoading,
    user,
  };
}
