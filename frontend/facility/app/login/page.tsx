"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import { useLogin } from "@/lib/hooks/useAuth";

const loginSchema = z.object({
  username: z.string().min(1, "아이디를 입력해주세요"),
  password: z.string().min(1, "비밀번호를 입력해주세요"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function FacilityLoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const { mutate: login, isPending } = useLogin();

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormData) => {
    login({
      username: data.username,
      password: data.password,
    });
  };

  const handleAdminSystem = () => {
    window.location.href = "http://localhost:3001/login";
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-2xl bg-white border-0">
        <CardHeader className="text-center space-y-6 pb-8">
          <div className="flex justify-center mb-6">
            <div className="relative w-60 h-20">
              <Image
                src="/images/korea-blind-union-logo.png"
                alt="한국시각장애인연합회 로고"
                fill
                className="object-contain"
                priority
                sizes="(max-width: 768px) 240px, 240px"
              />
            </div>
          </div>
          <CardTitle className="text-4xl font-bold text-black leading-tight">가치봄 플러스</CardTitle>
          <CardTitle className="text-3xl font-semibold text-gray-700 leading-tight">시설관리자시스템</CardTitle>
        </CardHeader>

        <CardContent className="space-y-8 px-8 pb-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-3">
              <Label htmlFor="username" className="text-xl font-medium text-black">
                관리자 ID
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="관리자 ID를 입력하세요"
                {...register("username")}
                className="w-full text-xl py-3 px-4 border-2 border-gray-300 focus:border-blue-500"
              />
              {errors.username && (
                <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>
              )}
            </div>

            <div className="space-y-3">
              <Label htmlFor="password" className="text-xl font-medium text-black">
                비밀번호
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="비밀번호를 입력하세요"
                  {...register("password")}
                  className="w-full pr-12 text-xl py-3 px-4 border-2 border-gray-300 focus:border-blue-500"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-6 w-6 text-gray-600" />
                  ) : (
                    <Eye className="h-6 w-6 text-gray-600" />
                  )}
                </Button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isPending}
              className="w-full bg-black text-white font-semibold py-4 text-xl hover:bg-gray-800 transition-colors"
            >
              {isPending ? "로그인 중..." : "로그인"}
            </Button>
          </form>

          <Button
            onClick={handleAdminSystem}
            variant="outline"
            className="w-full border-2 border-gray-300 py-4 text-xl font-semibold hover:bg-gray-50"
          >
            최고관리자시스템 연결
          </Button>

          <div className="bg-gray-100 p-6 rounded-lg space-y-3 border">
            <p className="text-xl font-semibold text-black">테스트 계정:</p>
            <div className="text-lg text-gray-700 space-y-2">
              <p className="font-medium">시설관리자: facility / facility123</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
