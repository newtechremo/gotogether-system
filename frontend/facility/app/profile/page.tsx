'use client';

import { ProtectedRoute } from "@/lib/components/ProtectedRoute";
import { Navigation } from "@/components/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileForm } from "@/components/profile/profile-form";
import { PasswordChangeForm } from "@/components/profile/password-change-form";
import { useProfile } from "@/lib/hooks/useProfile";
import { Loader2 } from "lucide-react";

export default function ProfilePage() {
  const { data: profile, isLoading } = useProfile();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-white">
        <Navigation />

        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-black mb-2 leading-relaxed">프로필 관리</h1>
            <p className="text-lg text-gray-600 leading-relaxed">시설 정보 및 비밀번호를 관리하세요</p>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
            </div>
          ) : !profile ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-gray-500">프로필 정보를 불러올 수 없습니다.</p>
              </CardContent>
            </Card>
          ) : (
            <Tabs defaultValue="profile" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="profile">프로필 정보</TabsTrigger>
                <TabsTrigger value="password">비밀번호 변경</TabsTrigger>
              </TabsList>

              <TabsContent value="profile">
                <Card>
                  <CardHeader>
                    <CardTitle>시설 정보</CardTitle>
                    <CardDescription>
                      담당자 정보를 수정할 수 있습니다. 시설 코드와 시설명은 변경할 수 없습니다.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ProfileForm profile={profile} />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="password">
                <Card>
                  <CardHeader>
                    <CardTitle>비밀번호 변경</CardTitle>
                    <CardDescription>
                      보안을 위해 주기적으로 비밀번호를 변경하세요. 최소 8자 이상, 영문과 숫자를 포함해야 합니다.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <PasswordChangeForm />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
