"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authService, type LoginRequest, type UserData } from "../api/auth.service";
import { toast } from "sonner";

/**
 * 로그인 훅
 */
export function useLogin() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LoginRequest) => authService.login(data),
    onSuccess: (response) => {
      // 토큰과 사용자 정보 저장
      authService.saveToken(response.data.access_token);
      authService.saveUser(response.data.user);

      // 캐시 업데이트
      queryClient.setQueryData(["currentUser"], response.data.user);

      // 성공 메시지
      toast.success("로그인 성공", {
        description: `환영합니다, ${response.data.user.name}님!`,
      });

      // 시설관리 페이지로 이동
      router.push("/facilities");
    },
    onError: (error: any) => {
      // NestJS의 기본 에러 응답 형식: { statusCode, message, error }
      const errorMessage = error.response?.data?.message || "로그인에 실패했습니다.";
      const statusCode = error.response?.data?.statusCode;

      toast.error("로그인 실패", {
        description: errorMessage,
      });

      console.error("Login error:", statusCode, errorMessage);
    },
  });
}

/**
 * 로그아웃 훅
 */
export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      // 캐시 클리어
      queryClient.clear();

      // 로그인 페이지로 이동
      router.push("/login");

      toast.success("로그아웃되었습니다");
    },
  });
}

/**
 * 현재 사용자 정보 조회 훅
 */
export function useCurrentUser() {
  return useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const response = await authService.getCurrentUser();
      return response.data;
    },
    enabled: authService.isAuthenticated(),
    staleTime: 5 * 60 * 1000, // 5분
    retry: false,
  });
}

/**
 * 인증 상태 확인 훅
 */
export function useAuthStatus() {
  const { data: user, isLoading, error } = useCurrentUser();
  const isAuthenticated = authService.isAuthenticated();

  return {
    user,
    isLoading,
    isAuthenticated: isAuthenticated && !!user,
    error,
  };
}
