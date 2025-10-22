"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateProfile } from "@/lib/hooks/useProfile";
import type { FacilityProfile, UpdateProfileRequest } from "@/lib/api/profile.service";
import { Loader2 } from "lucide-react";

interface ProfileFormProps {
  profile: FacilityProfile;
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const { register, handleSubmit, formState: { errors, isDirty } } = useForm<UpdateProfileRequest>({
    defaultValues: {
      managerName: profile.managerName || '',
      managerPhone: profile.managerPhone || '',
      address: profile.address || '',
    },
  });

  const updateProfile = useUpdateProfile();

  const onSubmit = (data: UpdateProfileRequest) => {
    updateProfile.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* 수정 불가 정보 */}
      <div className="space-y-4 pb-6 border-b">
        <div className="grid gap-2">
          <Label className="text-gray-700">시설 코드</Label>
          <Input value={profile.facilityCode} disabled className="bg-gray-50" />
        </div>

        <div className="grid gap-2">
          <Label className="text-gray-700">시설명</Label>
          <Input value={profile.facilityName} disabled className="bg-gray-50" />
        </div>

        <div className="grid gap-2">
          <Label className="text-gray-700">로그인 아이디</Label>
          <Input value={profile.username} disabled className="bg-gray-50" />
        </div>
      </div>

      {/* 수정 가능 정보 */}
      <div className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="managerName">담당자명</Label>
          <Input
            id="managerName"
            {...register("managerName")}
            placeholder="담당자 이름을 입력하세요"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="managerPhone">담당자 전화번호</Label>
          <Input
            id="managerPhone"
            {...register("managerPhone", {
              pattern: {
                value: /^01[0-9]-\d{4}-\d{4}$/,
                message: "010-XXXX-XXXX 형식으로 입력해주세요"
              }
            })}
            placeholder="010-1234-5678"
          />
          {errors.managerPhone && (
            <p className="text-sm text-red-500">{errors.managerPhone.message}</p>
          )}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="address">주소</Label>
          <Textarea
            id="address"
            {...register("address")}
            placeholder="시설 주소를 입력하세요"
            rows={3}
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={!isDirty || updateProfile.isPending}
        className="w-full"
      >
        {updateProfile.isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            저장 중...
          </>
        ) : (
          '프로필 저장'
        )}
      </Button>
    </form>
  );
}
