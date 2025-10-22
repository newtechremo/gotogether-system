"use client";

import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useChangePassword } from "@/lib/hooks/useProfile";
import type { ChangePasswordRequest } from "@/lib/api/profile.service";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

export function PasswordChangeForm() {
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<ChangePasswordRequest>();
  const changePassword = useChangePassword();
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const newPassword = watch("newPassword");

  const onSubmit = (data: ChangePasswordRequest) => {
    changePassword.mutate(data, {
      onSuccess: () => {
        reset();
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="currentPassword">현재 비밀번호</Label>
          <div className="relative">
            <Input
              id="currentPassword"
              type={showPasswords.current ? "text" : "password"}
              {...register("currentPassword", {
                required: "현재 비밀번호를 입력해주세요"
              })}
              placeholder="현재 비밀번호"
            />
            <button
              type="button"
              onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.currentPassword && (
            <p className="text-sm text-red-500">{errors.currentPassword.message}</p>
          )}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="newPassword">새 비밀번호</Label>
          <div className="relative">
            <Input
              id="newPassword"
              type={showPasswords.new ? "text" : "password"}
              {...register("newPassword", {
                required: "새 비밀번호를 입력해주세요",
                minLength: {
                  value: 8,
                  message: "비밀번호는 최소 8자 이상이어야 합니다"
                },
                pattern: {
                  value: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/,
                  message: "영문과 숫자를 포함해야 합니다"
                }
              })}
              placeholder="최소 8자, 영문+숫자 조합"
            />
            <button
              type="button"
              onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.newPassword && (
            <p className="text-sm text-red-500">{errors.newPassword.message}</p>
          )}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="confirmPassword">새 비밀번호 확인</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showPasswords.confirm ? "text" : "password"}
              {...register("confirmPassword", {
                required: "새 비밀번호 확인을 입력해주세요",
                validate: (value) => value === newPassword || "비밀번호가 일치하지 않습니다"
              })}
              placeholder="새 비밀번호 재입력"
            />
            <button
              type="button"
              onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
          )}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>비밀번호 요구사항:</strong>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>최소 8자 이상</li>
            <li>영문과 숫자 포함 필수</li>
            <li>특수문자 사용 가능 (@$!%*#?&)</li>
          </ul>
        </p>
      </div>

      <Button
        type="submit"
        disabled={changePassword.isPending}
        className="w-full"
      >
        {changePassword.isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            변경 중...
          </>
        ) : (
          '비밀번호 변경'
        )}
      </Button>
    </form>
  );
}
