"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useResetFacilityPassword } from "@/lib/hooks/useFacility";
import { Loader2, Copy, Check, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

interface ResetPasswordModalProps {
  facilityId: number;
  facilityName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ResetPasswordModal({
  facilityId,
  facilityName,
  open,
  onOpenChange,
}: ResetPasswordModalProps) {
  const [mode, setMode] = useState<"auto" | "manual">("auto");
  const [manualPassword, setManualPassword] = useState("");
  const [newPassword, setNewPassword] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const resetPassword = useResetFacilityPassword();

  const handleReset = () => {
    const data = mode === "auto"
      ? { autoGenerate: true }
      : { newPassword: manualPassword };

    console.log('[비밀번호 재설정] 요청 시작', {
      facilityId,
      facilityName,
      mode,
      data
    });

    resetPassword.mutate(
      { id: facilityId, data },
      {
        onSuccess: (response) => {
          console.log('[비밀번호 재설정] 성공 응답 받음:', {
            fullResponse: response,
            responseData: response.data,
            newPassword: response.data?.newPassword,
            message: response.data?.message
          });

          // response.data가 { newPassword: "...", message: "..." } 형태
          setNewPassword(response.data.newPassword);
          toast.success("비밀번호가 재설정되었습니다", {
            description: `${facilityName}의 비밀번호가 변경되었습니다.`,
          });
        },
        onError: (error: any) => {
          console.error('[비밀번호 재설정] 에러 발생:', {
            error,
            errorResponse: error.response,
            errorData: error.response?.data,
            errorMessage: error.message,
            errorStatus: error.response?.status
          });

          toast.error("비밀번호 재설정 실패", {
            description: error.response?.data?.error?.message || error.message || "알 수 없는 오류가 발생했습니다.",
          });
        }
      }
    );
  };

  const handleCopy = async () => {
    if (newPassword) {
      await navigator.clipboard.writeText(newPassword);
      setCopied(true);
      toast.success("복사되었습니다", {
        description: "비밀번호가 클립보드에 복사되었습니다.",
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setMode("auto");
    setManualPassword("");
    setNewPassword(null);
    setCopied(false);
    setShowPassword(false);
    onOpenChange(false);
  };

  const isPasswordValid = () => {
    if (mode === "auto") return true;
    return manualPassword.length >= 8 && /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/.test(manualPassword);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">비밀번호 재설정</DialogTitle>
        </DialogHeader>

        {newPassword ? (
          <div className="space-y-4 py-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800 mb-2">
                <strong>{facilityName}</strong>의 새 비밀번호:
              </p>
              <div className="flex items-center gap-2 bg-white p-3 rounded border">
                <code className="flex-1 text-lg font-mono font-bold text-green-700">
                  {newPassword}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  className="shrink-0"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>주의:</strong> 이 비밀번호를 안전하게 보관하세요. 창을 닫으면 다시 확인할 수 없습니다.
              </p>
            </div>

            <Button onClick={handleClose} className="w-full">
              확인
            </Button>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>{facilityName}</strong>의 비밀번호를 재설정합니다.
              </p>
            </div>

            <div className="space-y-3">
              <Label>재설정 방식</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={mode === "auto" ? "default" : "outline"}
                  onClick={() => setMode("auto")}
                  className="flex-1"
                >
                  자동 생성
                </Button>
                <Button
                  type="button"
                  variant={mode === "manual" ? "default" : "outline"}
                  onClick={() => setMode("manual")}
                  className="flex-1"
                >
                  직접 입력
                </Button>
              </div>
            </div>

            {mode === "manual" && (
              <div className="space-y-2">
                <Label htmlFor="newPassword">새 비밀번호</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    value={manualPassword}
                    onChange={(e) => setManualPassword(e.target.value)}
                    placeholder="최소 8자, 영문+숫자 조합"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-500" />
                    )}
                  </button>
                </div>
                {manualPassword && !isPasswordValid() && (
                  <p className="text-sm text-red-500">
                    비밀번호는 최소 8자 이상, 영문과 숫자를 포함해야 합니다.
                  </p>
                )}
              </div>
            )}

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-700 font-semibold">
                비밀번호 요구사항:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-sm text-gray-700">
                <li>최소 8자 이상</li>
                <li>영문과 숫자 포함 필수</li>
                <li>특수문자 사용 가능 (@$!%*#?&)</li>
              </ul>
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Button variant="outline" onClick={handleClose}>
                취소
              </Button>
              <Button
                onClick={handleReset}
                disabled={!isPasswordValid() || resetPassword.isPending}
              >
                {resetPassword.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    재설정 중...
                  </>
                ) : (
                  "재설정"
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
