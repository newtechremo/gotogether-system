"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { useLogin } from "@/lib/hooks/useAuth";
import Image from "next/image";

// 로그인 폼 스키마
const loginSchema = z.object({
  username: z.string().min(1, "관리자 ID를 입력해주세요"),
  password: z.string().min(1, "비밀번호를 입력해주세요"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const { mutate: login, isPending } = useLogin();

  // 컴포넌트 마운트 시 기존 인증 정보 정리
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      document.cookie = 'admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
    }
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormData) => {
    login(data);
  };

  const handleFacilitySystem = () => {
    // 시설관리자시스템 연결 (향후 구현)
    window.open("/facility", "_blank");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-lg bg-white">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center mb-4">
            <Image
              src="/images/korea-blind-union-logo.png"
              alt="한국시각장애인연합회 로고"
              width={200}
              height={60}
              className="object-contain"
              priority
            />
          </div>
          <CardTitle className="text-3xl font-bold text-black">가치봄 플러스</CardTitle>
          <CardTitle className="text-2xl font-semibold text-gray-700">Go Together 관리 시스템</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* 관리자 ID 입력 */}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-base font-medium text-black">
                관리자 ID
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="관리자 ID를 입력하세요"
                className="w-full text-base"
                {...register("username")}
                disabled={isPending}
              />
              {errors.username && (
                <p className="text-sm text-red-600">{errors.username.message}</p>
              )}
            </div>

            {/* 비밀번호 입력 */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-base font-medium text-black">
                비밀번호
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="비밀번호를 입력하세요"
                  className="w-full pr-10 text-base"
                  {...register("password")}
                  disabled={isPending}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-600" />
                  )}
                </Button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            {/* 로그인 버튼 */}
            <Button
              type="submit"
              className="w-full bg-black text-white font-medium py-3 text-base hover:bg-gray-800"
              disabled={isPending}
            >
              {isPending ? "로그인 중..." : "로그인"}
            </Button>
          </form>

          {/* 시설관리자시스템 연결 버튼 */}
          <Button
            onClick={handleFacilitySystem}
            variant="outline"
            className="w-full border-gray-300 text-black hover:bg-gray-50 bg-white py-3 text-base"
            type="button"
          >
            시설관리자시스템 연결
          </Button>

          {/* 테스트 계정 안내 */}
          <div className="bg-gray-100 p-4 rounded-lg space-y-2">
            <p className="text-base font-medium text-black">테스트 계정:</p>
            <div className="text-base text-gray-700 space-y-1">
              <p>최고관리자: admin / admin123</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
